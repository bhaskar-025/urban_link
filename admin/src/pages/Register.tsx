import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { MonoInput } from '../components/ui/MonoInput';
import { MonoButton } from '../components/ui/MonoButton';

export const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', { name, email, password, city, phoneNumber, role: 'admin' });
            setAuth(data, data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full my-8 bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-purple-900/5">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#6032db] text-white flex items-center justify-center font-bold text-base shadow-md shadow-[#6032db]/25 mb-4">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3effe] text-[11px] font-bold text-[#6032db] mb-2">
                        <Sparkles size={12} />
                        <span>Authority Enrollment</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
                        Create Admin Account
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 m-0 max-w-xs">
                        Register a new municipal administrator account for the CitySync governance network.
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-semibold mb-6 flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <MonoInput
                        label="Full Name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Officer Vikram Sharma"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MonoInput
                            label="Email Address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="officer@citysync.gov"
                        />

                        <MonoInput
                            label="Jurisdiction City"
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Nagpur"
                        />
                    </div>
                    
                    <MonoInput
                        label="Contact Number"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                    />

                    <div className="relative">
                        <MonoInput
                            label="Password"
                            type={showPass ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="pt-3">
                        <MonoButton 
                            type="submit" 
                            fullWidth 
                            disabled={loading} 
                            className="py-3 font-bold flex items-center justify-center gap-2"
                        >
                            <span>{loading ? 'Creating account...' : 'Create Administrator Account'}</span>
                            <ArrowRight size={15} />
                        </MonoButton>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs">
                    <span className="text-slate-500">Already registered as an administrator? </span>
                    <Link to="/login" className="text-[#6032db] font-bold hover:underline underline-offset-4">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};
