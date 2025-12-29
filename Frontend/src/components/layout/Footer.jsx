import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-4 inline-block">
                            MusicStreamz
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your ultimate destination for music streaming. Discover, play, and connect with the rhythms that move you.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-green-400 transition-colors">About Us</Link></li>
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Careers</Link></li>
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Press</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Communities</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-green-400 transition-colors">For Artists</Link></li>
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Developers</Link></li>
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Advertising</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Useful Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Support</Link></li>
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Web Player</Link></li>
                            <li><Link to="#" className="hover:text-green-400 transition-colors">Mobile App</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs text-center md:text-left">
                        &copy; {new Date().getFullYear()} MusicStreamz. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                        </Link>
                        <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-3.77 1.795c-.95.043-1.505.2-2.058.423-.469.186-.81.455-1.125.772-.317.315-.586.656-.772 1.125-.224.553-.38 1.107-.424 2.058-.042.92-.052 1.197-.052 3.293v.043c0 2.097.01 2.374.052 3.293.044.95.2 1.505.424 2.058.186.469.455.81.772 1.125.315.317.656.586 1.125.772.553.224 1.107.38 2.058.424.92.042 1.197.052 3.293.052h.043c2.097 0 2.374-.01 3.293-.052.95-.044 1.505-.2 2.058-.424.469-.186.81-.455 1.125-.772.317-.315.586-.656.772-1.125.224-.553.38-1.107.424-2.058.042-.92.052-1.197.052-3.293v-.043c0-2.097-.01-2.374-.052-3.293-.044-.95-.2-1.505-.424-2.058-.186-.469-.455-.81-.772-1.125-.315-.317-.656-.586-1.125-.772-.553-.224-1.107-.38-2.058-.424-.92-.042-1.197-.052-3.293-.052h-.043c-2.097 0-2.374.01-3.293.052zm5.838 3.668l-.004.001c.576 0 1.043.467 1.043 1.043 0 .575-.467 1.043-1.043 1.043s-1.043-.467-1.043-1.043c0-.575.467-1.043 1.043-1.043zm-6.49 1.362a5.918 5.918 0 015.918 5.918 5.918 5.918 0 01-5.918 5.918 5.918 5.918 0 01-5.918-5.918 5.918 5.918 0 015.918-5.918zm0 1.795a4.122 4.122 0 00-4.122 4.122 4.122 4.122 0 004.122 4.122 4.122 4.122 0 004.122-4.122 4.122 4.122 0 00-4.122-4.122z" clipRule="evenodd" /></svg>
                        </Link>
                        <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
