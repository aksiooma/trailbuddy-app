
import { BikeDetailProps } from './Types/types'
import React from "react";
import AccordionItem from './AccordionItem'; // Import the AccordionItem component

const BikeDetailAccordion: React.FC<BikeDetailProps> = ({ bike }) => {

  // Split the specs string by comma and trim whitespace
  const specList = bike.specs.split(',').map(spec => spec.trim())
  const sizingList = bike.sizing.split(',').map(spec => spec.trim())


  return (

    <div className='Accordion'>
      <hr></hr>
      <AccordionItem key="1" ariaLabel="Desc" title="Description" className="p-3 mt-3 mb-2 border-1 border-teal-500/50 rounded hover:border-teal-700/50 transition-colors duration-200 focus:outline-none">
        {bike.desc}
      </AccordionItem>
      
      <AccordionItem key="2" ariaLabel="Spec" title="Specifications" className="p-3 mt-2 mb-2 border-1 border-teal-500/50 rounded hover:border-teal-700/50 transition-colors duration-200 focus:outline-none">
        {specList.map((spec, index) => (
          <div key={index}>{spec}</div>
        ))}
      </AccordionItem>
      <AccordionItem key="3" ariaLabel="Size" title="Sizing" className="p-3 mt-2 mb-3 border-1 border-teal-500/50 rounded hover:border-teal-700/50  transition-colors duration-200 focus:outline-none">
      {sizingList.map((spec, index) => (
          <div key={index}>{spec}</div>
        ))}
      </AccordionItem>
      <hr></hr>
     
    </div>

  );
}

export default BikeDetailAccordion
