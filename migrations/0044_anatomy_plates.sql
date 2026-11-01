-- A prateleira de anatomia volta a ser a prancha dos sistemas e do coração.
-- Seringas volta às peças nomeadas. As fichas em texto continuam no próprio endereço.

delete from library_item where shelf_id in ('anatomia', 'seringas');

update library_shelf
set kind = 'images',
    lead = 'Sistemas e câmaras do coração, na prancha recuperada da biblioteca. Não é silhueta e não fecha diagnóstico.'
where id = 'anatomia';

update library_shelf
set kind = 'images',
    lead = 'Peças e volumes da seringa, na prancha recuperada. O calibre da instituição não está nesta imagem.'
where id = 'seringas';

insert into library_item (shelf_id, position, title, text, href) values
('anatomia', 1, 'Visão geral', 'Prancha de anatomia com os sistemas do corpo.', '/bibliotecas/anatomia/hub-hero-anatomy.avif'),
('anatomia', 2, 'Esquelético', 'Ilustração do sistema esquelético.', '/bibliotecas/anatomia/system-skeletal.avif'),
('anatomia', 3, 'Muscular', 'Ilustração do sistema muscular.', '/bibliotecas/anatomia/system-muscular.avif'),
('anatomia', 4, 'Cardiovascular', 'Ilustração do coração e dos vasos.', '/bibliotecas/anatomia/system-heart.avif'),
('anatomia', 5, 'Respiratório', 'Ilustração dos pulmões e das vias respiratórias.', '/bibliotecas/anatomia/system-lungs.avif'),
('anatomia', 6, 'Digestório', 'Ilustração do tubo digestório.', '/bibliotecas/anatomia/system-digestive.avif'),
('anatomia', 7, 'Nervoso', 'Ilustração do encéfalo.', '/bibliotecas/anatomia/system-brain.avif'),
('anatomia', 8, 'Urinário', 'Ilustração do rim e da via urinária.', '/bibliotecas/anatomia/glossy-3d-kidney-and-urinary-tract-anatomy.avif'),
('anatomia', 9, 'Átrio direito', 'Corte do coração com o átrio direito em destaque.', '/bibliotecas/anatomia/heart-atrium-right.avif'),
('anatomia', 10, 'Átrio esquerdo', 'Corte do coração com o átrio esquerdo em destaque.', '/bibliotecas/anatomia/heart-atrium-left.avif'),
('anatomia', 11, 'Ventrículo direito', 'Corte do coração com o ventrículo direito em destaque.', '/bibliotecas/anatomia/heart-ventricle-right.avif'),
('anatomia', 12, 'Ventrículo esquerdo', 'Corte do coração com o ventrículo esquerdo em destaque.', '/bibliotecas/anatomia/heart-ventricle-left.avif'),
('anatomia', 13, 'Valva tricúspide', 'Valva tricúspide no corte do coração.', '/bibliotecas/anatomia/heart-tricuspid.avif'),
('anatomia', 14, 'Valva mitral', 'Valva mitral no corte do coração.', '/bibliotecas/anatomia/heart-mitral.avif'),
('anatomia', 15, 'Valva pulmonar', 'Valva pulmonar no corte do coração.', '/bibliotecas/anatomia/heart-pulmonary.avif'),
('anatomia', 16, 'Aorta', 'Aorta no corte do coração.', '/bibliotecas/anatomia/heart-aorta.avif'),
('seringas', 1, 'Seringa', 'Seringa em vista geral.', '/bibliotecas/seringas/00-hero-seringa-white.avif'),
('seringas', 2, 'Luer slip', 'Conector luer slip.', '/bibliotecas/seringas/01-luer-slip.avif'),
('seringas', 3, 'Luer lock', 'Conector luer lock.', '/bibliotecas/seringas/02-luer-lock.avif'),
('seringas', 4, '1 mL', 'Seringa de 1 mL.', '/bibliotecas/seringas/03-capacidade-1ml.avif'),
('seringas', 5, '5 mL', 'Seringa de 5 mL.', '/bibliotecas/seringas/05-capacidade-5ml.avif'),
('seringas', 6, '10 mL', 'Seringa de 10 mL.', '/bibliotecas/seringas/06-capacidade-10ml.avif'),
('seringas', 7, '20 mL', 'Seringa de 20 mL.', '/bibliotecas/seringas/07-capacidade-20ml-white.avif'),
('seringas', 8, '50–60 mL', 'Seringa de 50 a 60 mL.', '/bibliotecas/seringas/08-capacidade-50-60ml.avif'),
('seringas', 9, 'Componentes', 'Corpo, êmbolo e conector nomeados.', '/bibliotecas/seringas/09-seringa-componentes-white.avif'),
('seringas', 10, 'Êmbolo', 'Êmbolo no centro do corpo.', '/bibliotecas/seringas/10-embolo-central.avif'),
('seringas', 11, 'Êmbolo de segurança', 'Êmbolo com trava.', '/bibliotecas/seringas/11-embolo-seguranca.avif'),
('seringas', 12, 'Agulhas', 'Agulhas em cores de calibre.', '/bibliotecas/seringas/five-color-coded-medical-needles.avif')
on conflict (shelf_id, position) do nothing;
