import {Accordion, AccordionItem} from "@nextui-org/react";
import { BikeDetailProps } from './Types/types'

const BikeDetailAccordion: React.FC<BikeDetailProps> = ({ bike }) => {



return (
    <Accordion>
      <AccordionItem key="1" aria-label="Accordion 1" title="Description" className="p-3 mt-2 mb-2 border-1 border-teal-500/50 rounded">
      {bike.desc}
      </AccordionItem>
      <AccordionItem key="2" aria-label="Accordion 2" title="Specifications" className="p-3 mt-2 mb-2 border-1 border-teal-500/50 rounded">
      
      </AccordionItem>
      <AccordionItem key="3" aria-label="Accordion 3" title="Size details" className="p-3 mt-2 mb-2 border-1 border-teal-500/50 rounded">
      
      </AccordionItem>
    </Accordion>
  );
}

export default BikeDetailAccordion