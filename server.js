import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());
app.use(cors());

//conectar ao mongoDB

mongoose.connect(process.env.MONGODB_URI, { dbname: 'Aulas' })
    .then(() => console.log('conectado ao mongoDB'))
    .catch(err => console.error('Erro na conexão: ', err.message));

//modelo aluno
const alunoSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true, minlenght: 2 },
    idade: { type: Number, required: true, min: 0, max: 120 },
    curso: { type: String, required: true, trim: true, },
    notas: { type: [Number], default: [], validate: v => v.every(n => n >= 0 && n <= 10) }
}, { collection: 'alunos', timestamps: true });
const Aluno = mongoose.model('aluno', alunoSchema, 'alunos');

//rota inicial
app.get('/', (req, res) => res.json({ msg: 'api rodando' }));

//criar aluno
app.post('/alunos', async (req, res) => {
    const aluno = await Aluno.create(req.body);
    res.status(201).json(aluno);
});

//listar alunos
app.get('/alunos', async (req, res) => {
    const alunos = await Aluno.find();
    res.json(alunos);
});

//iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Servidor rodando em http://localhost:${PORT}`)
);

//atualizar aluno
app.put('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "id inválido" });
        }
        const aluno = await Aluno.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, overwrite: true }
        );
        if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
        res.json(aluno);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//deletar aluno
app.delete('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "id inválido" });
        }
        const aluno = await Aluno.findByIdAndDelete(req.params.id);
        if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
        res.json({ok: true});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/alunos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "id inválido" });
        }
        const aluno = await Aluno.findById(req.params.id);
        if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
        res.json(aluno);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})