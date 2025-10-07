import React from 'react';
import { RibData } from '../types';

interface RibPreviewProps {
  data: RibData;
}

const RibPreview: React.FC<RibPreviewProps> = ({ data }) => {
  const displayBankName = data.bank === 'AUTRE' ? data.customBankName : data.bank;

  const rawIban = data.iban.replace(/\s/g, '');
  const codeBanque = rawIban.substring(4, 9) || '00000';
  const codeGuichet = rawIban.substring(9, 14) || '00000';
  const numeroCompte = rawIban.substring(14, 25) || '00000000000';
  const cleRib = rawIban.substring(25, 27) || '00';
  
  const addressParts = data.address.split('\n');

  return (
    <div className="w-full bg-white p-6 font-sans text-gray-900 flex flex-col rounded-xl shadow-lg border border-slate-200 aspect-[1.41] justify-between" aria-live="polite" aria-atomic="true">
      <div> {/* Main Content Wrapper */}
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="w-24 h-12 flex items-center">
            {data.bankLogo && (
              <img src={data.bankLogo} alt="Aperçu du logo de la banque" className="max-w-full max-h-full object-contain" crossOrigin="anonymous" />
            )}
          </div>
          <div className="text-right">
            <h1 className="font-bold text-base tracking-wider">RELEVÉ D'IDENTITÉ BANCAIRE</h1>
          </div>
        </header>

        {/* Domiciliation & Titulaire */}
        <section className="mt-8 pt-2 border-t-2 border-orange-500">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-orange-500 uppercase mb-2 text-xs tracking-wide">Banque</h2>
              <p className="font-semibold text-sm break-words">{displayBankName || '...'}</p>
            </div>
            <div>
              <h2 className="font-bold text-orange-500 uppercase mb-2 text-xs tracking-wide">Titulaire</h2>
              <p className="font-semibold text-xs break-words">{data.holderName || '...'}</p>
              {addressParts.map((line, index) => (
                <p key={index} className="text-xs break-words">{line || (index === 0 && '...')}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Account numbers table */}
        <section className="mt-6">
          <div className="grid grid-cols-[1.5fr,1.5fr,3fr,1fr] border-2 border-black">
              <div className="p-2 border-r-2 border-black">
                  <p className="text-[10px] text-gray-700">Code banque</p>
                  <p className="text-orange-500 font-mono font-bold text-sm mt-1">{codeBanque}</p>
              </div>
              <div className="p-2 border-r-2 border-black">
                  <p className="text-[10px] text-gray-700">Code guichet</p>
                  <p className="text-orange-500 font-mono font-bold text-sm mt-1">{codeGuichet}</p>
              </div>
              <div className="p-2 border-r-2 border-black">
                  <p className="text-[10px] text-gray-700">N° de compte</p>
                  <p className="text-orange-500 font-mono font-bold text-sm mt-1 break-all">{numeroCompte}</p>
              </div>
              <div className="p-2">
                  <p className="text-[10px] text-gray-700">Clé</p>
                  <p className="text-orange-500 font-mono font-bold text-sm mt-1">{cleRib}</p>
              </div>
          </div>
        </section>

        {/* IBAN & BIC table */}
        <section className="mt-1">
           <div className="grid grid-cols-3 border-2 border-black">
            <div className="col-span-2 p-2 border-r-2 border-black">
              <p className="text-[10px] text-gray-700">IBAN (International bank account number)</p>
              <p className="font-mono font-semibold text-sm mt-1 break-all">{data.iban || '...'}</p>
            </div>
            <div className="p-2">
              <p className="text-[10px] text-gray-700">BIC</p>
              <p className="font-mono font-semibold text-sm mt-1">{data.bic || '...'}</p>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="text-center mt-4">
        <p className="text-[7px] text-gray-500 leading-tight mb-1">
          Ce relevé est destiné à être remis, sur leur demande, à vos créanciers ou débiteurs appelés à faire inscrire des opérations à votre compte (virement, paiement de quittance, etc.).
        </p>
        <p className="text-[7px] text-gray-500 leading-tight">
          Son utilisation vous garantit le bon enregistrement des opérations en cause et vous évite ainsi des réclamations pour erreurs ou retards d'imputation.
        </p>
      </footer>
    </div>
  );
};

export default RibPreview;