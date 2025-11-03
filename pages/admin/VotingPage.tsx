
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Poll } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminVotingPage: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPollQuestion, setNewPollQuestion] = useState('');
    const [newPollOptions, setNewPollOptions] = useState<string[]>(['', '']);

    const fetchPolls = useCallback(async () => {
        setLoading(true);
        const { data: pollsData, error: pollsError } = await supabase
            .from('polls')
            .select('*')
            .order('created_at', { ascending: false });

        if (pollsError) {
            console.error('Error fetching polls:', pollsError.message);
            setLoading(false);
            return;
        }

        const pollsWithWithOptions = await Promise.all(
            pollsData.map(async (poll) => {
                const { data: optionsData, error: optionsError } = await supabase
                    .from('poll_options')
                    .select('*')
                    .eq('poll_id', poll.id);
                if (optionsError) console.error('Error fetching options:', optionsError.message);
                return { ...poll, poll_options: optionsData || [] };
            })
        );

        setPolls(pollsWithWithOptions);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleAddOption = () => {
        setNewPollOptions([...newPollOptions, '']);
    };
    
    const handleRemoveOption = (index: number) => {
        if (newPollOptions.length > 2) {
            const updatedOptions = newPollOptions.filter((_, i) => i !== index);
            setNewPollOptions(updatedOptions);
        }
    };
    
    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...newPollOptions];
        updatedOptions[index] = value;
        setNewPollOptions(updatedOptions);
    };

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        // Create poll
        const { data, error } = await supabase
            .from('polls')
            .insert({ question: newPollQuestion })
            .select()
            .single();

        if (error || !data) {
            console.error('Error creating poll:', error?.message);
            return;
        }

        // Create options
        const optionsToInsert = newPollOptions
            .filter(opt => opt.trim() !== '')
            .map(opt => ({ poll_id: data.id, text: opt }));

        if (optionsToInsert.length > 0) {
            const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);
            if (optionsError) console.error('Error creating options:', optionsError.message);
        }

        setIsModalOpen(false);
        setNewPollQuestion('');
        setNewPollOptions(['', '']);
        fetchPolls();
    };
        
    const togglePollStatus = async (poll: Poll) => {
        const { error } = await supabase.from('polls').update({ is_active: !poll.is_active }).eq('id', poll.id);
        if (error) console.error('Error toggling poll status:', error.message);
        else fetchPolls();
    };
    
    const deletePoll = async (pollId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus polling ini? Semua data suara akan hilang.')) {
            const { error } = await supabase.from('polls').delete().eq('id', pollId);
            if (error) console.error('Error deleting poll:', error.message);
            else fetchPolls();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Voting</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Buat Poll Baru</Button>
            </div>

            {loading ? <Spinner /> : polls.length === 0 ? (
                 <Card className="text-center py-12">
                     <p className="text-gray-500">Belum ada polling. Buat yang pertama!</p>
                 </Card>
            ) : (
                <div className="space-y-6">
                    {polls.map(poll => (
                        <Card key={poll.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{poll.question}</CardTitle>
                                        <span className={`text-sm font-semibold px-2 py-1 rounded-full mt-2 inline-block ${poll.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {poll.is_active ? 'Aktif' : 'Ditutup'}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="secondary" onClick={() => togglePollStatus(poll)}>
                                            {poll.is_active ? 'Tutup Poll' : 'Aktifkan Poll'}
                                        </Button>
                                        <Button variant="danger" onClick={() => deletePoll(poll.id)}>
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold text-gray-700 mb-2">Hasil Voting:</h3>
                                {poll.poll_options.reduce((acc, opt) => acc + opt.vote_count, 0) > 0 ? (
                                    <div className="h-64 mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={poll.poll_options} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="text" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="vote_count" name="Jumlah Suara" fill="#f43f86" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Belum ada suara yang masuk.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Poll Baru">
                <form onSubmit={handleCreatePoll} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan Poll</label>
                        <Input
                            value={newPollQuestion}
                            onChange={(e) => setNewPollQuestion(e.target.value)}
                            placeholder="Contoh: Siapa ketua OSIS pilihanmu?"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilihan Jawaban</label>
                        <div className="space-y-2">
                            {newPollOptions.map((opt, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Input
                                        value={opt}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Pilihan ${index + 1}`}
                                        required
                                    />
                                    {newPollOptions.length > 2 && (
                                        <Button type="button" variant="danger" onClick={() => handleRemoveOption(index)} className="px-2 py-1 h-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                         <Button type="button" variant="secondary" className="mt-2" onClick={handleAddOption}>+ Tambah Pilihan</Button>
                    </div>
                    <div className="flex justify-end space-x-2">
                         <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                         <Button type="submit">Buat Poll</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminVotingPage;
