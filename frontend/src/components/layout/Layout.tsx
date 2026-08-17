import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../ui/LanguageSelector';
import { Sparkles, ArrowRight } from 'lucide-react';

const BrandLogo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#6032db] flex items-center justify-center text-white font-bold shadow-md shadow-[#6032db]/20">
      <Sparkles size={22} />
    </div>
    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center leading-none">
      CitySync<span className="text-[#6032db]">.</span>
    </span>
  </div>
);

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const GithubIcon = () => (
    <svg fill="currentColor" className="text-slate-400 hover:text-[#6032db] transition-colors cursor-pointer" width="16" height="16" viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg"><path d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z" /></svg>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-4 md:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="focus-visible:outline-none hover:opacity-90 transition-opacity">
            <BrandLogo />
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="flex items-center gap-4 text-xs font-bold text-slate-600">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`hover:text-[#6032db] transition-colors ${location.pathname === '/dashboard' ? 'text-[#6032db]' : ''}`}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/submit"
                    className={`hover:text-[#6032db] transition-colors ${location.pathname === '/submit' ? 'text-[#6032db]' : ''}`}
                  >
                    {t('nav.submit')}
                  </Link>
                  <Link
                    to="/issues"
                    className={`hover:text-[#6032db] transition-colors ${location.pathname === '/issues' ? 'text-[#6032db]' : ''}`}
                  >
                    Issues
                  </Link>
                  <Link
                    to="/community"
                    className={`hover:text-[#6032db] transition-colors ${location.pathname === '/community' ? 'text-[#6032db]' : ''}`}
                  >
                    Forum
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`hover:text-[#6032db] transition-colors ${location.pathname === '/login' ? 'text-[#6032db]' : ''}`}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#6032db] text-white hover:bg-[#5024c9] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <span>Register</span>
                    <ArrowRight size={13} />
                  </Link>
                </>
              )}
            </nav>

            <div className="h-4 w-[1px] bg-slate-200"></div>
            <LanguageSelector variant="header" />
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-50 border-t border-slate-100 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CitySync.</span>
            <span>·</span>
            <span>Intelligent Urban Complaint Routing</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="https://github.com/SparshGupta78/CitySync" target="_blank" className="hover:text-[#6032db] transition-colors flex items-center gap-1.5">
              <GithubIcon />
              <span>GitHub</span>
            </Link>
            <LanguageSelector variant="footer" />
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
