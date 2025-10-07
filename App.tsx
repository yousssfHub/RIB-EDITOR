
import React, { useState, useRef, useCallback } from 'react';
import { RibData } from './types';
import { BANKS } from './constants';
import { BANK_LOGOS } from './bankLogos';
import RibPdfTemplate from './components/RibPdfTemplate';
import RibPreview from './components/RibPreview';
import { UploadIcon, DownloadIcon } from './components/icons';

// FIX: To solve the error on line 61, `window.jspdf` is typed. Modern jspdf versions attach to `window`.
// The unused `declare var jsPDF: any;` is removed.
declare global {
  interface Window {
    jspdf: any;
  }
}
declare var html2canvas: any;

const initialFormData: RibData = {
  bank: '',
  customBankName: '',
  bankLogo: null,
  iban: '',
  bic: '',
  holderName: '',
  address: '',
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<RibData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (pdfError) setPdfError(null);
    const { name, value } = e.target;

    if (name === 'bank') {
      const bankName = value;
      const logoUrl = BANK_LOGOS[bankName] || null;
      
      setFormData(prev => ({
        ...prev,
        bank: bankName,
        bankLogo: logoUrl,
        customBankName: bankName === 'AUTRE' ? prev.customBankName : '',
      }));

      if (bankName !== 'AUTRE') {
        setLogoFileName(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pdfError) setPdfError(null);
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const formattedValue = value.slice(0, 27).match(/.{1,4}/g)?.join(' ') || '';
    setFormData(prev => ({...prev, iban: formattedValue}));
  };

  const handleBicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pdfError) setPdfError(null);
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setFormData(prev => ({...prev, bic: value.slice(0, 11)}));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pdfError) setPdfError(null);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, bankLogo: reader.result as string }));
        setLogoFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = formData.bank && formData.iban && formData.bic && formData.holderName && (formData.bank !== 'AUTRE' || formData.customBankName);

  const generatePdf = useCallback(async () => {
    if (!pdfTemplateRef.current || !isFormValid) return;

    setIsLoading(true);
    setPdfError(null);
    try {
      const { jsPDF } = window.jspdf;
      const canvas = await html2canvas(pdfTemplateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff', // Explicitly set background to white
      });

      // Use JPEG format with a high quality setting for smaller file size.
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('RIB.pdf');

      // Clear the form on successful generation
      setFormData(initialFormData);
      setLogoFileName(null);

    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      setPdfError(`La génération du PDF a échoué. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Générateur de RIB</h1>
          <p className="text-slate-600 mt-2">Créez un Relevé d'Identité Bancaire professionnel au format PDF.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Column 1: Form */}
          <div className="bg-white rounded-xl shadow-2xl shadow-slate-200">
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <div className="md:col-span-2">
                  <label htmlFor="bank" className="block text-sm font-medium text-slate-700 mb-1">Banque</label>
                  <select id="bank" name="bank" value={formData.bank} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <option value="" disabled>Veuillez sélectionner la banque</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {formData.bank === 'AUTRE' && (
                  <>
                    <div className="md:col-span-1">
                      <label htmlFor="customBankName" className="block text-sm font-medium text-slate-700 mb-1">Nom de la banque</label>
                      <input type="text" id="customBankName" name="customBankName" value={formData.customBankName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Ex: Ma Banque Personnelle" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Logo de la banque (optionnel)</label>
                      <label htmlFor="bankLogo" className="relative flex items-center justify-center w-full h-10 px-3 py-2 border border-slate-300 rounded-md shadow-sm cursor-pointer hover:bg-slate-50 transition">
                        <UploadIcon className="w-5 h-5 text-slate-500 mr-2" />
                        <span className="text-sm text-slate-600 truncate">{logoFileName || 'Choisir un fichier...'}</span>
                        <input id="bankLogo" name="bankLogo" type="file" onChange={handleLogoChange} className="sr-only" accept="image/png, image/jpeg, image/svg+xml" />
                      </label>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label htmlFor="iban" className="block text-sm font-medium text-slate-700 mb-1">IBAN</label>
                  <input type="text" id="iban" name="iban" value={formData.iban} onChange={handleIbanChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono" placeholder="FR76 3000 4000 0500 0012 3456 789" />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="bic" className="block text-sm font-medium text-slate-700 mb-1">BIC</label>
                  <input type="text" id="bic" name="bic" value={formData.bic} onChange={handleBicChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono" placeholder="BNPAFRPPXXX" />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="holderName" className="block text-sm font-medium text-slate-700 mb-1">Nom & Prénom du titulaire</label>
                  <input type="text" id="holderName" name="holderName" value={formData.holderName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Ex: Jean Dupont" />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Ex: 123 Rue de la République, 75001 Paris" />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-6 rounded-b-xl border-t border-slate-200">
              <button onClick={generatePdf} disabled={!isFormValid || isLoading} className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Générer le RIB en PDF
                  </>
                )}
              </button>
              {!isFormValid && <p className="text-xs text-center text-slate-500 mt-3">Veuillez remplir tous les champs obligatoires pour générer le PDF.</p>}
              {pdfError && <p className="text-xs text-center text-red-600 mt-3">{pdfError}</p>}
            </div>
          </div>

          {/* Column 2: Preview */}
          <div className="lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center lg:text-left">Aperçu en direct</h2>
            <RibPreview data={formData} />
          </div>
        </main>
      </div>
      <RibPdfTemplate data={formData} templateRef={pdfTemplateRef} />
    </div>
  );
};

export default App;