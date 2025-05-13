import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {}
                    <div>
                        <h3 className="text-lg font-bold mb-4">RoabH Mart</h3>
                        <p className="text-sm">
                            Your one-stop shop for all your shopping needs. Quality products at affordable prices.
                        </p>
                    </div>

                    {}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="text-sm hover:text-primary transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=featured" className="text-sm hover:text-primary transition-colors">
                                    Featured Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=new" className="text-sm hover:text-primary transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=sale" className="text-sm hover:text-primary transition-colors">
                                    Sale Items
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/contact" className="text-sm hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm hover:text-primary transition-colors">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-sm hover:text-primary transition-colors">
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-sm hover:text-primary transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
                        <p className="text-sm mb-4">
                            Subscribe to our newsletter for the latest products and offers.
                        </p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} RoabH Mart. All rights reserved.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="text-sm hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm hover:text-primary transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
} 