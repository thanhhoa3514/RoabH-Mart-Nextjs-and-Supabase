'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            toast.success('Successfully subscribed to newsletter!');
            setEmail('');
            setLoading(false);
        }, 1000);
    };

    return (
        <section className="mb-16">
            <Card className="bg-primary/5 border-primary/20">
                <div className="p-8 md:p-12">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-3">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                Stay updated with our latest offers, new arrivals, and exclusive deals
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 h-12"
                            />
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading}
                                className="group"
                            >
                                {loading ? (
                                    'Subscribing...'
                                ) : (
                                    <>
                                        Subscribe
                                        <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <p className="text-sm text-muted-foreground">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </Card>
        </section>
    );
}
