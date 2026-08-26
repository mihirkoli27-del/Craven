import React, { useState, useRef, useMemo } from 'react';
import {
  Camera,
  UploadCloud,
  Search,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  TrendingDown,
  Trash2,
  Sliders,
  Plus,
  Minus,
  Check,
  Flame,
  Activity,
  Heart,
  Droplet,
} from 'lucide-react';
import { FoodScanResult } from '../types';
import {
  formatCalories,
  formatGrams,
} from '../utils/formatters';
import {
  FOOD_DATABASE,
  searchDatabase,
  convertDatabaseItemToScanResult,
  DatabaseFoodItem,
} from '../data/foodDatabase';

const CATEGORIES = [
  'All Items',
  'High Protein',
  'Grains & Breads',
  'Dals & Curries',
  'Dairy & Eggs',
  'Snacks & Nuts',
  'Fruits & Veggies',
  'Packaged & Street Food',
  'Beverages',
] as const;

export const FoodAnalyzerView: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [selectedFoodItem, setSelectedFoodItem] = useState<DatabaseFoodItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera capture modal state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Filter food database
  const filteredDatabaseItems = useMemo(() => {
    let items = FOOD_DATABASE;
    if (selectedCategory !== 'All Items') {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q) ||
          item.dietaryBadges.some((b) => b.toLowerCase().includes(q))
      );
    }
    return items;
  }, [selectedCategory, searchQuery]);

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchDatabase(searchQuery).slice(0, 6);
  }, [searchQuery]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImagePreview(evt.target?.result as string);
        setSearchQuery('');
        setSelectedFoodItem(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Camera
  const handleStartCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      setError('Unable to access device camera. Please upload a label image directly.');
    }
  };

  // Capture photo from video
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        setSearchQuery('');
        setSelectedFoodItem(null);
      }
      handleStopCamera();
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Select item from database
  const handleSelectDatabaseItem = (item: DatabaseFoodItem, multiplier: number = 1) => {
    setSelectedFoodItem(item);
    setPortionMultiplier(multiplier);
    setSearchQuery(item.name);
    setIsSearchFocused(false);
    const converted = convertDatabaseItemToScanResult(item, multiplier);
    setResult(converted);
    setError(null);
  };

  // Change portion multiplier dynamically
  const handlePortionChange = (newMultiplier: number) => {
    const validMultiplier = Math.max(0.1, Math.min(10, Math.round(newMultiplier * 10) / 10));
    setPortionMultiplier(validMultiplier);

    if (selectedFoodItem) {
      const updated = convertDatabaseItemToScanResult(selectedFoodItem, validMultiplier);
      setResult(updated);
    } else if (result) {
      // Scale existing result
      const oldMultiplier = result.portionMultiplier || 1;
      const factor = validMultiplier / oldMultiplier;
      const rounded = (v: number) => Math.round(v * factor * 10) / 10;

      setResult({
        ...result,
        portionMultiplier: validMultiplier,
        calories: Math.round(result.calories * factor),
        protein: rounded(result.protein),
        carbs: rounded(result.carbs),
        fat: rounded(result.fat),
        saturatedFat: result.saturatedFat ? rounded(result.saturatedFat) : undefined,
        fiber: result.fiber ? rounded(result.fiber) : undefined,
        naturalSugar: rounded(result.naturalSugar),
        addedSugar: rounded(result.addedSugar),
        sodium: result.sodium ? Math.round(result.sodium * factor) : undefined,
        servingSize: `${validMultiplier}x portion (${result.baseServingSize || result.servingSize})`,
      });
    }
  };

  // Deep AI Analyze function
  const handleAnalyze = async (queryOverride?: string) => {
    const q = queryOverride || searchQuery.trim();
    if (!imagePreview && !q) {
      setError('Please upload a food label image or enter a food name in the database search.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSearchFocused(false);

    try {
      const res = await fetch('/api/analyze-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview || null,
          query: q || null,
          age: age ? parseInt(age) : null,
          weight: weight ? parseInt(weight) : null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze food.');
      }

      const data = await res.json();
      data.baseServingSize = data.servingSize;
      data.portionMultiplier = 1;
      setPortionMultiplier(1);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // If network/API error, try matching local database
      const fallbackMatch = searchDatabase(q)[0];
      if (fallbackMatch) {
        handleSelectDatabaseItem(fallbackMatch, 1);
      } else {
        setError(err.message || 'Error communicating with analyzer server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setSearchQuery('');
    setSelectedFoodItem(null);
    setPortionMultiplier(1);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Score circle calculations
  const score = result?.healthScore ?? 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let scoreColor = '#4E3120'; // Coffee Brown
  if (score < 50) scoreColor = '#dc2626'; // Red
  else if (score < 75) scoreColor = '#A65B27'; // Warm Roasted Amber

  // Macro Energy Distribution
  const totalMacroCalories = result ? (result.protein * 4) + (result.carbs * 4) + (result.fat * 9) : 0;
  const proteinPercent = totalMacroCalories > 0 && result ? Math.round((result.protein * 4 / totalMacroCalories) * 100) : 0;
  const carbsPercent = totalMacroCalories > 0 && result ? Math.round((result.carbs * 4 / totalMacroCalories) * 100) : 0;
  const fatPercent = totalMacroCalories > 0 && result ? Math.round((result.fat * 9 / totalMacroCalories) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Main Dual Box Layout: Scan / Upload on Left, Search Database on Right */}
      {!result && (
        <div className="max-w-2xl mx-auto w-full">
          {/* Left: Scan / Upload Label */}
          <div
            className="rounded-3xl border p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-bold font-serif flex items-center gap-2"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <Camera className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                  Scan Nutrition Label
                </h3>
                {imagePreview && (
                  <button
                    onClick={() => setImagePreview(null)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {imagePreview ? (
                <div
                  className="relative rounded-2xl overflow-hidden border max-h-52 flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <img src={imagePreview} alt="Food Label" className="max-h-52 object-contain" />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 hover:opacity-90"
                  style={{
                    borderColor: 'var(--theme-border-subtle)',
                    backgroundColor: 'var(--theme-subtle)',
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mx-auto"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      color: 'var(--theme-primary-text)',
                    }}
                  >
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    Upload Food Label Image
                  </div>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    Drag &amp; drop or click to browse (JPG, PNG, WEBP)
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-medium border rounded-xl transition-colors cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Use Camera</span>
                </button>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => handleAnalyze()}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                    style={{
                      backgroundColor: 'var(--theme-btn-bg)',
                      color: 'var(--theme-btn-text)',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Analyze Image</span>
                  </button>
                )}
              </div>
            </div>

            {/* Optional Age/Weight Personalization */}
            <div
              className="pt-4 border-t space-y-2 text-xs"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <span
                className="text-[11px] font-semibold block"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Optional Profile for Tailored Guidance:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Age (e.g. 28)"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
                  className="p-2 rounded-xl text-xs border focus:outline-hidden"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Weight (kg e.g. 68)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                  className="p-2 rounded-xl text-xs border focus:outline-hidden"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          className="rounded-3xl border p-10 text-center space-y-4 shadow-xs"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto animate-spin"
            style={{
              backgroundColor: 'var(--theme-primary-light)',
              color: 'var(--theme-primary-text)',
            }}
          >
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3
              className="text-lg font-bold font-serif"
              style={{ color: 'var(--theme-text)' }}
            >
              Calculating Precision Nutritional Profile
            </h3>
            <p
              className="text-xs"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Parsing portions, calculating natural vs added sugars, Craven Health Score, and formulating healthy swaps...
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div
          className="rounded-3xl border p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-300"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          {/* Header Row & Portion Multiplier Bar */}
          <div
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border inline-block"
                  style={{
                    backgroundColor: 'var(--theme-primary-light)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-primary-text)',
                  }}
                >
                  {result.category || 'Nutritional Profile'}
                </span>
                {result.glycemicIndex && (
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${
                      result.glycemicIndex === 'Low'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : result.glycemicIndex === 'Medium'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    GI: {result.glycemicIndex} Glycemic Index
                  </span>
                )}
              </div>
              <h3
                className="text-2xl sm:text-3xl font-bold font-serif"
                style={{ color: 'var(--theme-text)' }}
              >
                {result.foodName}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Standard Serving: <span className="font-semibold text-stone-800">{result.servingSize}</span>
              </p>
            </div>

            {/* Serving / Portion Multiplier Controls */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <div
                className="flex items-center border rounded-xl p-1 gap-1"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handlePortionChange(portionMultiplier - 0.5)}
                  disabled={portionMultiplier <= 0.5}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer hover:opacity-80 disabled:opacity-30"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="px-2 text-xs font-bold text-center min-w-16">
                  {portionMultiplier}x portion
                </div>
                <button
                  type="button"
                  onClick={() => handlePortionChange(portionMultiplier + 0.5)}
                  disabled={portionMultiplier >= 10}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer hover:opacity-80 disabled:opacity-30"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Multiplier Buttons */}
              <div className="flex items-center gap-1">
                {[0.5, 1, 2, 3].map((mul) => (
                  <button
                    key={mul}
                    type="button"
                    onClick={() => handlePortionChange(mul)}
                    className={`px-2 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      portionMultiplier === mul ? 'font-bold shadow-xs' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor:
                        portionMultiplier === mul ? 'var(--theme-btn-bg)' : 'var(--theme-subtle)',
                      borderColor:
                        portionMultiplier === mul ? 'var(--theme-btn-bg)' : 'var(--theme-border)',
                      color:
                        portionMultiplier === mul ? 'var(--theme-btn-text)' : 'var(--theme-text)',
                    }}
                  >
                    {mul}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border rounded-xl transition-colors cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Search</span>
              </button>
            </div>
          </div>

          {/* Health Score & Key Nutrient Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Score Radial Card (4 Cols) */}
            <div
              className="lg:col-span-4 p-5 rounded-2xl border flex items-center space-x-5"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="var(--theme-border)"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={scoreColor}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black" style={{ color: 'var(--theme-text)' }}>
                    {result.healthScore}
                  </span>
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-subtle)' }}>
                    / 100
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Craven Grade
                </span>
                <div
                  className={`text-lg font-bold ${
                    result.healthStatus === 'Healthy'
                      ? 'text-emerald-700'
                      : result.healthStatus === 'Moderate'
                      ? 'text-amber-700'
                      : 'text-red-600'
                  }`}
                >
                  {result.healthStatus}
                </div>
                <p
                  className="text-[11px] leading-tight"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {result.healthScore >= 80
                    ? 'Nutrient-dense whole food.'
                    : result.healthScore >= 55
                    ? 'Balanced profile; consume in moderation.'
                    : 'High added sugar, refined oils, or sodium.'}
                </p>
              </div>
            </div>

            {/* 6 Nutrient Capsules (8 Cols) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Calories */}
              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>
                  Total Calories
                </span>
                <span className="text-base font-bold mt-0.5 block" style={{ color: 'var(--theme-accent)' }}>
                  {formatCalories(result.calories)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>Energy yield</span>
              </div>

              {/* Protein */}
              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>
                  Protein
                </span>
                <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                  {formatGrams(result.protein)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>Muscle repair</span>
              </div>

              {/* Total Carbs */}
              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>
                  Carbohydrates
                </span>
                <span className="text-base font-bold mt-0.5 block" style={{ color: 'var(--theme-text)' }}>
                  {formatGrams(result.carbs)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>
                  {result.fiber ? `${formatGrams(result.fiber)} fiber` : 'Complex energy'}
                </span>
              </div>

              {/* Total Fat & Saturated Fat */}
              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>
                  Total Fat
                </span>
                <span className="text-base font-bold mt-0.5 block" style={{ color: 'var(--theme-text)' }}>
                  {formatGrams(result.fat)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>
                  {result.saturatedFat ? `${formatGrams(result.saturatedFat)} sat fat` : 'Lipids & oils'}
                </span>
              </div>

              {/* Added Sugar vs Natural Sugar */}
              <div
                className={`p-3 rounded-2xl border text-center ${
                  result.addedSugar > 8 ? 'bg-red-50 border-red-200' : ''
                }`}
                style={{
                  backgroundColor: result.addedSugar > 8 ? undefined : 'var(--theme-subtle)',
                  borderColor: result.addedSugar > 8 ? undefined : 'var(--theme-border)',
                }}
              >
                <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>
                  Added Sugar
                </span>
                <span className={`text-base font-bold mt-0.5 block ${result.addedSugar > 8 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {formatGrams(result.addedSugar)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>
                  {formatGrams(result.naturalSugar)} natural
                </span>
              </div>

              {/* Sodium */}
              <div
                className="p-3 rounded-2xl border text-center"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span className="block text-[10px] font-bold uppercase" style={{ color: 'var(--theme-text-muted)' }}>
                  Sodium
                </span>
                <span className="text-base font-bold mt-0.5 block" style={{ color: 'var(--theme-text)' }}>
                  {result.sodium ? `${result.sodium} mg` : '< 100 mg'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>Electrolyte</span>
              </div>
            </div>
          </div>

          {/* Macro Calorie Energy Distribution Bar */}
          {totalMacroCalories > 0 && (
            <div
              className="p-4 rounded-2xl border space-y-2 text-xs"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span style={{ color: 'var(--theme-text)' }}>Macronutrient Energy Distribution:</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700">Protein: {proteinPercent}%</span>
                  <span className="text-amber-700">Carbs: {carbsPercent}%</span>
                  <span className="text-rose-700">Fat: {fatPercent}%</span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/10">
                <div style={{ width: `${proteinPercent}%` }} className="bg-emerald-600 h-full" title={`Protein ${proteinPercent}%`} />
                <div style={{ width: `${carbsPercent}%` }} className="bg-amber-500 h-full" title={`Carbs ${carbsPercent}%`} />
                <div style={{ width: `${fatPercent}%` }} className="bg-rose-500 h-full" title={`Fat ${fatPercent}%`} />
              </div>
            </div>
          )}

          {/* Evidence-Based Nutritional Assessment & Insights */}
          <div
            className="rounded-2xl p-5 border space-y-3 text-xs"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--theme-text)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                Biochemical Assessment & Insights:
              </h4>
              {result.dietaryBadges && result.dietaryBadges.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {result.dietaryBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md border text-[10px] font-semibold"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="leading-relaxed font-medium" style={{ color: 'var(--theme-text)' }}>
              {result.reason}
            </p>

            <div className="space-y-2 pt-1">
              {result.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--theme-accent)' }} />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>

            {/* Vitamins & Minerals Section */}
            {result.vitaminsAndMinerals && Object.keys(result.vitaminsAndMinerals).length > 0 && (
              <div className="pt-3 border-t border-black/5">
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--theme-text-muted)' }}>
                  Key Vitamins & Essential Minerals:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.vitaminsAndMinerals).map(([vit, val], vIdx) => (
                    <span
                      key={vIdx}
                      className="px-2.5 py-1 rounded-lg border text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-primary-text)',
                      }}
                    >
                      <strong className="font-bold">{vit}:</strong> {val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Healthier Food Swap Card */}
          {result.budgetAlternative && (
            <div
              className="rounded-2xl p-5 border text-xs space-y-2.5 shadow-xs"
              style={{
                backgroundColor: 'var(--theme-accent-light)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span
                  className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]"
                  style={{ color: 'var(--theme-accent-text)' }}
                >
                  <TrendingDown className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  Healthier Food Swap:
                </span>
                <span
                  className="px-2.5 py-1 rounded-lg font-bold border shadow-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-accent-text)',
                  }}
                >
                  Nutrient Dense Alternative
                </span>
              </div>
              <h5
                className="text-base font-bold font-serif"
                style={{ color: 'var(--theme-text)' }}
              >
                {result.budgetAlternative.name}
              </h5>
              <p
                className="leading-relaxed"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {result.budgetAlternative.reason}
              </p>
            </div>
          )}

          {/* Personalized Guidance if Age or Weight provided */}
          {result.personalizedTips && (
            <div
              className="p-4 border rounded-2xl text-xs"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-primary-text)',
              }}
            >
              <span className="font-bold block mb-1">Personalized Guidance:</span>
              <p className="leading-relaxed">{result.personalizedTips}</p>
            </div>
          )}

          {/* Raw OCR text if image */}
          {result.extractedText && (
            <details
              className="text-xs pt-2 border-t"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
            >
              <summary className="cursor-pointer font-medium hover:opacity-80">
                View OCR / Nutrition Source Verification Details
              </summary>
              <pre
                className="mt-2 p-3 rounded-xl text-[11px] font-mono whitespace-pre-wrap border"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                {result.extractedText}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Camera Capture Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className="rounded-3xl max-w-lg w-full p-5 space-y-4 border shadow-2xl"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="text-sm font-bold font-serif"
                style={{ color: 'var(--theme-text)' }}
              >
                Point Camera at Nutrition Label
              </h4>
              <button
                onClick={handleStopCamera}
                className="text-xs cursor-pointer hover:opacity-80"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Close
              </button>
            </div>

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-4 border-2 rounded-xl pointer-events-none"
                style={{ borderColor: 'var(--theme-accent)' }}
              ></div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleStopCamera}
                className="px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  color: 'var(--theme-text)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="px-6 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                }}
              >
                <Camera className="w-4 h-4" />
                <span>Capture Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
