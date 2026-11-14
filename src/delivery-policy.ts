export const LIFTING_CATEGORIES=['Rough Terrain Cranes','Boom Trucks','Telehandlers'];
type DeliveryProduct={id:string;category:string;addOns:string[];extra?:unknown};
export function bundledAccessory(product:DeliveryProduct,machines:DeliveryProduct[]){
 if(LIFTING_CATEGORIES.includes(product.category))return false;
 return (product.category==='Attachments'&&machines.length>0)||machines.some(machine=>machine.addOns.includes(product.id));
}
