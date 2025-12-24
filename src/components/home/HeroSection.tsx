'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, TrendingUp, Shield } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-2xl mb-12">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-block">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                <TrendingUp className="w-4 h-4" />
                                New Arrivals Available
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                            Discover Amazing
                            <span className="block text-primary mt-2">Products Today</span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                            Shop the latest trends with unbeatable prices. Quality products delivered right to your doorstep.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button asChild size="lg" className="group">
                                <Link href="/products">
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Shop Now
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline" size="lg">
                                <Link href="/products?sort=newest">
                                    View New Arrivals
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-8 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="w-5 h-5 text-primary" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Quality Guaranteed</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span>Free Shipping</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl transform rotate-3"></div>
                        <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                            <Image
                                src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop"
                                alt="RoabH Mart Hero"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-xl shadow-lg border">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <ShoppingBag className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">1000+</p>
                                    <p className="text-sm text-muted-foreground">Happy Customers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
