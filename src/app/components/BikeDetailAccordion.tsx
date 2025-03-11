import React from "react";
import { BikeDetailProps } from './Types/types';
import AccordionItem from './AccordionItem';
import { useLanguage } from '../context/LanguageContext';

const BikeDetailAccordion: React.FC<BikeDetailProps> = ({ bike }) => {
  const { t } = useLanguage();
  
  // Split the specs string by comma and trim whitespace
  const specList = bike.specs ? bike.specs.split(',').map(spec => spec.trim()) : [];
  const sizingList = bike.sizing ? bike.sizing.split(',').map(spec => spec.trim()) : [];

  return (
    <div className='space-y-4 font-schibsted'>
      <AccordionItem 
        key="1" 
        ariaLabel="Desc" 
        title={t('bikeDetail.description')} 
        className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden"
      >
        <div className="p-4 text-zinc-300">
          {bike.desc}
        </div>
      </AccordionItem>
      
      <AccordionItem 
        key="2" 
        ariaLabel="Spec" 
        title={t('bikeDetail.specifications')} 
        className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden"
      >
        <div className="p-4 space-y-2 text-zinc-300">
          {specList.map((spec, index) => (
            <div key={index} className="flex items-center">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
              {spec}
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem 
        key="3" 
        ariaLabel="Size" 
        title={t('bikeDetail.sizing')} 
        className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden"
      >
        <div className="p-4 space-y-2 text-zinc-300">
          {sizingList.map((spec, index) => (
            <div key={index} className="flex items-center">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
              {spec}
            </div>
          ))}
        </div>
      </AccordionItem>
    </div>
  );
}

export default BikeDetailAccordion;
