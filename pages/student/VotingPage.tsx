


import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Poll, Vote } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#f43f86', '#fb71a6', '#fda4c4', '#fecddf', '#ffe4ec'];

const StudentVotingPage: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [userVotes, setUserVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Fetch all polls with their options
        const { data: pollsData, error: pollsError } = await supabase
            .from('polls')
            .select('*, poll_options(*)')
            .order('created_at', { ascending: false });
        
        if (pollsError) console.error('Error fetching polls:', pollsError.message);
        else setPolls(pollsData || []);

        // Fetch user's votes to see what they've already voted on
        const { data: votesData, error: votesError } = await supabase
            .from('votes')
            .select('*');
        
        if (votesError) console.error('Error fetching user votes:', votesError.message);
        else setUserVotes(votesData || []);

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVote = async (optionId: string) => {
        const { data, error } = await supabase.rpc('handle_vote', { option_id_to_vote: optionId });
        if (error) {
            console.error('Error voting:', error.message);
            if (error.message.includes('Could not find the function')) {
                toast.error("Fungsi 'handle_vote' tidak ditemukan di database. Admin perlu menjalankan skrip SQL dari 'services/supabase.ts' (Bagian 4).", { duration: 8000 });
            } else {
                toast.error("Gagal memberikan suara.");
            }
        } else {
            if (data.includes('Error')) {
                toast.error(data.replace('Error: ', ''));
            } else {
                toast.success("Suara berhasil direkam!");
                fetchData();
            }
        }
    };
    
    const activePolls = polls.filter(p => p.is_active);
    const finishedPolls = polls.filter(p => !p.is_active);

    const hasVotedInPoll = (pollId: string) => {
        return userVotes.some(vote => vote.poll_id === pollId);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800 text-center">Sistem Voting</h1>
                <p className="text-gray-500 mt-2 text-center">Berikan suaramu dan lihat hasilnya!</p>
            </div>

            {loading ? <Spinner /> : (
                <>
                    {/* Active Polls */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Polling Aktif</h2>
                        {activePolls.length > 0 ? activePolls.map(poll => (
                            <Card key={poll.id} className="mb-6">
                                <CardHeader>
                                    <CardTitle>{poll.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {hasVotedInPoll(poll.id) ? (
                                        <p className="text-center font-semibold text-green-600 bg-green-100 p-4 rounded-lg">Terima kasih, Anda sudah memberikan suara untuk polling ini!</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {poll.poll_options.map(opt => (
                                                <button 
                                                    key={opt.id}
                                                    onClick={() => handleVote(opt.id)}
                                                    className="w-full text-left p-3 border border-brand-pink-200 rounded-lg hover:bg-brand-pink-100 transition-colors font-medium text-gray-700"
                                                >
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )) : <Card className="text-center py-8"><p className="text-gray-500">Tidak ada polling yang sedang aktif.</p></Card>}
                    </section>
                    
                    {/* Finished Polls */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hasil Polling</h2>
                         {finishedPolls.length > 0 ? finishedPolls.map(poll => (
                            <Card key={poll.id} className="mb-6">
                                <CardHeader>
                                    <CardTitle>{poll.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={poll.poll_options} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" allowDecimals={false} />
                                                <YAxis type="category" dataKey="text" width={150} />
                                                <Tooltip cursor={{fill: 'rgba(244, 63, 134, 0.1)'}}/>
                                                <Bar dataKey="vote_count" name="Jumlah Suara">
                                                    {poll.poll_options.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : <Card className="text-center py-8"><p className="text-gray-500">Belum ada hasil polling yang tersedia.</p></Card>}
                    </section>
                </>
            )}
        </div>
    );
};

export default StudentVotingPage;
