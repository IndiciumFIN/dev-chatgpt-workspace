import {z} from 'zod';

/** Same contract used by editable fields and imported local metadata. */
export const adminContentSchema=z.object({
 slug:z.string().min(1),
 title:z.string().max(80).refine(s=>s.trim().length>=3,{message:'Título: mínimo de 3 caracteres.'}),
 lead:z.string().max(400).refine(s=>s.trim().length>=10,{message:'Descrição: mínimo de 10 caracteres.'}),
 published:z.boolean(),
});
export type AdminContent=z.infer<typeof adminContentSchema>;
export function parseAdminContent(input:unknown):AdminContent {
 const parsed=adminContentSchema.safeParse(input);
 if(parsed.success)return {...parsed.data,title:parsed.data.title.trim(),lead:parsed.data.lead.trim()};
 const field=parsed.error.issues[0]?.path[0];
 if(field==='title')throw new Error('Título inválido.');
 if(field==='lead')throw new Error('Descrição inválida.');
 if(field==='published')throw new Error('Estado de publicação inválido.');
 if(field==='slug')throw new Error('Identificador inválido.');
 throw new Error('Instrumento inválido.');
}
