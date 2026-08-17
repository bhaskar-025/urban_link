import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Navigation, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MonoInput } from '../components/ui/MonoInput';
import { MonoButton } from '../components/ui/MonoButton';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const LocationMarker = ({ position, setPosition }: any) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
};

const MapController = ({ center }: { center: L.LatLng | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const [timeOfOccurrence, setTimeOfOccurrence] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (position) {
      const fetchAddress = async () => {
        setAddressLoading(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&accept-language=en`
          );
          const data = await response.json();
          if (data && data.address) {
            setAddress(data.display_name || '');
            setCity(data.address.city || data.address.town || data.address.village || data.address.county || '');
            setState(data.address.state || '');
          }
        } catch (e) {
          console.error('Reverse geocoding failed', e);
        } finally {
          setAddressLoading(false);
        }
      };
      fetchAddress();
    }
  }, [position]);

  const handleAutoDetectGPS = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      setError('');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
          setIsLocating(false);
        },
        (err) => {
          setError(t('submit.locError') + ': ' + err.message);
          setIsLocating(false);
        }
      );
    } else {
      setError(t('submit.browserError') || 'Browser does not support geolocation.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageUploading(true);
      setImageError('');
      try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/complaints/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.url) {
          setImageUrl(data.url);
        }
      } catch (err: any) {
        setImageError(err.response?.data?.message || err.message || t('submit.uploadError'));
      } finally {
        setImageUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position && !address) {
      setError(t('submit.locError'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (timeOfOccurrence) formData.append('timeOfOccurrence', timeOfOccurrence);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('state', state);

      const submitLat = position
        ? position.lat.toString()
        : (21.1458 + (Math.random() - 0.5) * 0.1).toString();
      const submitLng = position
        ? position.lng.toString()
        : (79.0882 + (Math.random() - 0.5) * 0.1).toString();
      formData.append('lat', submitLat);
      formData.append('lng', submitLng);

      if (!imageUrl) {
        formData.append('images', '');
      } else {
        formData.append('images', imageUrl);
      }

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('submit.subError') || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 sm:px-6">
      <div className="border border-slate-200/90 bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-purple-900/5 font-sans text-slate-900">
        {/* Header */}
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0">
            {t('submit.header')}
          </h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            {t('submit.subheader')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Step 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#6032db] text-white text-[10px] font-bold flex items-center justify-center">1</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {t('submit.step1')}
              </span>
            </div>

            <MonoInput
              label={t('submit.titleLabel')}
              placeholder={t('submit.titlePlaceholder')}
              required
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-xs font-semibold text-slate-700">
                {t('submit.descLabel')}
              </label>
              <textarea
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#6032db] focus:bg-white focus:ring-4 focus:ring-[#6032db]/10 focus:outline-none transition-all min-h-[100px] resize-y"
                placeholder={t('submit.descPlaceholder')}
                required
                minLength={20}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#6032db] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t('submit.step2')}
                </span>
              </div>
              <button
                type="button"
                disabled={isLocating}
                onClick={handleAutoDetectGPS}
                className="bg-purple-50 text-[#6032db] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? t('submit.locating') : t('submit.useLocation')}</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 flex justify-between font-mono">
              <div>
                <span>{t('submit.lat')}</span> <strong className="text-slate-900 ml-1">{position ? position.lat.toFixed(6) : t('submit.notSelected')}</strong>
              </div>
              <div>
                <span>{t('submit.lng')}</span> <strong className="text-slate-900 ml-1">{position ? position.lng.toFixed(6) : t('submit.notSelected')}</strong>
              </div>
            </div>

            <div className="h-[220px] w-full rounded-2xl border border-slate-200/80 overflow-hidden relative z-0 shadow-2xs">
              <MapContainer
                center={[21.1458, 79.0882]}
                zoom={12}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <MapController center={position} />
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                  attribution='&copy; <a href="https://maps.google.com/">Google</a>'
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
              <div className="absolute top-2 right-2 z-[1000] bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg pointer-events-none shadow-sm">
                {t('submit.clickLoc')}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 relative">
              {addressLoading && (
                <div className="absolute top-8 right-0 text-[10px] text-[#6032db] font-bold animate-pulse">{t('submit.locating')}</div>
              )}
              <MonoInput
                label={t('submit.addressLabel')}
                placeholder="Street address or landmark"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MonoInput
                  label={t('submit.cityLabel')}
                  placeholder={t('submit.cityLabel')}
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <MonoInput
                  label={t('submit.stateLabel')}
                  placeholder={t('submit.stateLabel')}
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#6032db] text-white text-[10px] font-bold flex items-center justify-center">3</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {t('submit.step3')}
              </span>
            </div>

            {imageError && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {imageError}
              </div>
            )}

            {imageUploading ? (
              <div className="border border-dashed border-[#6032db] rounded-2xl p-8 text-center text-xs text-[#6032db] font-bold bg-purple-50/50">
                {t('submit.uploading')}
              </div>
            ) : imageUrl ? (
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden inline-block group max-w-xs shadow-sm">
                <img src={imageUrl} alt="Preview" className="w-full max-h-[220px] object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-md hover:bg-rose-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-slate-200 hover:border-[#6032db] hover:bg-purple-50/30 rounded-2xl p-6 cursor-pointer text-center flex flex-col items-center justify-center transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-[#6032db] mb-2 stroke-[1.75]" />
                <span className="text-xs font-bold text-slate-800">
                  {t('submit.uploadLabel')}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 m-0">{t('submit.uploadConstraint')}</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#6032db] text-white text-[10px] font-bold flex items-center justify-center">4</span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {t('submit.step4')}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-xs font-semibold text-slate-700">
                {t('submit.dateTimeLabel')}
              </label>
              <input
                type="datetime-local"
                required
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#6032db] focus:bg-white focus:ring-4 focus:ring-[#6032db]/10 focus:outline-none transition-all"
                value={timeOfOccurrence}
                onChange={(e) => setTimeOfOccurrence(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <MonoButton 
              type="submit" 
              fullWidth 
              variant="primary" 
              disabled={loading}
              className="py-3 font-bold text-xs"
            >
              {loading ? t('submit.submitting') : t('submit.submitBtn')}
            </MonoButton>
          </div>
        </form>
      </div>
    </div>
  );
};