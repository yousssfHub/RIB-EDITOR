import React from 'react';
import { RibData } from '../types';

interface RibPdfTemplateProps {
  data: RibData;
  templateRef: React.RefObject<HTMLDivElement>;
}

const RibPdfTemplate: React.FC<RibPdfTemplateProps> = ({ data, templateRef }) => {
  const displayBankName = data.bank === 'AUTRE' ? data.customBankName : data.bank;

  const rawIban = data.iban.replace(/\s/g, '');
  const codeBanque = rawIban.substring(4, 9);
  const codeGuichet = rawIban.substring(9, 14);
  const numeroCompte = rawIban.substring(14, 25);
  const cleRib = rawIban.substring(25, 27);
  
  const addressParts = data.address.split('\n');

  return (
    <div 
      ref={templateRef} 
      id="pdf-template" 
      className="absolute -left-[9999px] top-0 w-[842px] h-[595px] bg-white p-10 font-sans text-gray-900 flex flex-col justify-between"
    >
      <div> {/* Main Content Wrapper */}
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="w-48 h-24 flex items-center">
            {data.bankLogo && (
              <img src={data.bankLogo} alt="Logo de la banque" className="max-w-full max-h-full object-contain" crossOrigin="anonymous" />
            )}
          </div>
          <div className="text-right">
            <h1 className="font-bold text-lg tracking-wider">RELEVÉ D'IDENTITÉ BANCAIRE</h1>
          </div>
        </header>

        {/* Domiciliation & Titulaire */}
        <section className="mt-12 pt-2 border-t-2 border-orange-500">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h2 className="font-bold text-orange-500 uppercase mb-2 text-sm tracking-wide">Banque</h2>
              <p className="font-semibold text-lg">{displayBankName || '...'}</p>
            </div>
            <div>
              <h2 className="font-bold text-orange-500 uppercase mb-2 text-sm tracking-wide">Titulaire</h2>
              <p className="font-semibold text-sm">{data.holderName || '...'}</p>
              {addressParts.map((line, index) => (
                <p key={index} className="text-sm">{line}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Account numbers table */}
        <section className="mt-10">
          <div className="grid grid-cols-[1.5fr,1.5fr,3fr,1fr] border-2 border-black">
              <div className="p-2 border-r-2 border-black">
                  <p className="text-xs text-gray-700">Code banque</p>
                  <p className="text-orange-500 font-mono font-bold text-base mt-1">{codeBanque}</p>
              </div>
              <div className="p-2 border-r-2 border-black">
                  <p className="text-xs text-gray-700">Code guichet</p>
                  <p className="text-orange-500 font-mono font-bold text-base mt-1">{codeGuichet}</p>
              </div>
              <div className="p-2 border-r-2 border-black">
                  <p className="text-xs text-gray-700">N° de compte</p>
                  <p className="text-orange-500 font-mono font-bold text-base mt-1">{numeroCompte}</p>
              </div>
              <div className="p-2">
                  <p className="text-xs text-gray-700">Clé</p>
                  <p className="text-orange-500 font-mono font-bold text-base mt-1">{cleRib}</p>
              </div>
          </div>
        </section>

        {/* IBAN & BIC table */}
        <section className="mt-1">
           <div className="grid grid-cols-3 border-2 border-black">
            <div className="col-span-2 p-2 border-r-2 border-black">
              <p className="text-xs text-gray-700">IBAN (International bank account number)</p>
              <p className="font-mono font-semibold text-base mt-1 break-all">{data.iban}</p>
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-700">BIC</p>
              <p className="font-mono font-semibold text-base mt-1">{data.bic}</p>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="text-center">
        <p className="text-[8px] text-gray-500 mb-1">
          Ce relevé est destiné à être remis, sur leur demande, à vos créanciers ou débiteurs appelés à faire inscrire des opérations à votre compte (virement, paiement de quittance, etc.).
        </p>
        <p className="text-[8px] text-gray-500">
          Son utilisation vous garantit le bon enregistrement des opérations en cause et vous évite ainsi des réclamations pour erreurs ou retards d'imputation.
        </p>
      </footer>
    </div>
  );
};

export default RibPdfTemplate;