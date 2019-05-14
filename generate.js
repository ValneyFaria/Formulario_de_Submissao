const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const PDFDocument = require('pdfkit');

if (process.argv.length != 3) {
  console.error(`Modo de Usar: ${process.argv[1]} <arquivo_csv>`)
  process.exit(1);
}

fs.createReadStream(process.argv[2])
.pipe(csv())
.on('data', function(data){
  console.log(data);
  let fName = `${data['Título do Trabalho']} - ${data['Autores'].split('\n').join(' ')}`;

  let doc = new PDFDocument({
    size: 'A4',
    margins: 0
  });
  doc.pipe(fs.createWriteStream(`pdf/${fName}.pdf`));

  doc.image('img/logo.png', 35, 25, { width: 100, height: 100 })

  for (let i = 0; i < 3; i++) {
    doc.save()

    doc.rect(350, 25 + (260 * i), 200, 250).clip()
    doc.image(`img/img${i + 1}.png`, 350,  25 + (260 * i), { cover:[ 200, 250 ] , align: 'center' })

    doc.restore()
  }

  autores = data['Autores'].split('\n');

  doc.fontSize(18)
  doc.font('font/Montserrat-Light.ttf')
  for (let i = 0; i < autores.length; i++) {
    doc.text(autores[i].trim(), 165, 35 + (25 * i));
  }

  titulo = data['Título do Trabalho'].toUpperCase();

  doc.fontSize(25)
  doc.font('font/Montserrat-Bold.ttf')
  doc.text(titulo, 35, 150, {width: 280})

  doc.fontSize(18)
  doc.font('font/Montserrat-SemiBold.ttf')
  doc.text('Descrição', 35, 200)

  descrição = data['Descrição curta do trabalho']
  doc.fontSize(16)
  doc.font('font/Montserrat-Regular.ttf')
  doc.text(descrição, 35, 230, {width: 280})
  descricao_size = doc.heightOfString(descrição, {width: 280})

  doc.fontSize(18)
  doc.font('font/Montserrat-SemiBold.ttf')
  doc.text('Áreas de Impacto\nna Sociedade', 35, 270 + descricao_size)

  impacto = data['Áreas de Impacto na Sociedade'].split('\n')
  doc.fontSize(16)
  doc.font('font/Montserrat-Regular.ttf')
  for (let i = 0; i < impacto.length; i++) {
    doc.circle(37, 338 + descricao_size, 2).fill('black');
    doc.text(impacto[i].trim(), 47, 328 + descricao_size, {width: 268});
    descricao_size += doc.heightOfString(autores[i].trim(), {width: 268}) + 10;
  }

  doc.end();
});
