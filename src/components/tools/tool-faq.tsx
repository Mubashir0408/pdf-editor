import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FaqItem {
  q: string;
  a: string;
}

export function ToolFaq({ items }: { items: FaqItem[] }) {
  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Frequently asked questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
