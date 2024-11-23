import mongoose,{Document,Model,Schema, model} from "mongoose";


interface FaqItem extends Document{
    question: string;
    answer: string;
}

interface Layout extends Document{
    type: string;
    faq: FaqItem[];
} 

const faqSchema  = new Schema<FaqItem>({
    question:{type:String},
    answer: {type:String},
});

const layoutSchema = new Schema<Layout>({
    type: {type: String},
    faq: [faqSchema],
});

const LayoutModel = model<Layout>('Layout', layoutSchema);

export default LayoutModel;