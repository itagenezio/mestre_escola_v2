export interface ClassSession {
  materia: string;
  professor: string;
  turma: string;
  horaInicio: string;
  horaFim: string;
}

export const HORARIOS_AULAS = [
  { id: 1, inicio: "07:30", fim: "08:15" },
  { id: 2, inicio: "08:15", fim: "09:00" },
  { id: "intervalo1", inicio: "09:00", fim: "09:20", label: "INTERVALO" },
  { id: 3, inicio: "09:20", fim: "10:05" },
  { id: 4, inicio: "10:05", fim: "10:50" },
  { id: 5, inicio: "10:50", fim: "11:35" },
  { id: "intervalo2", inicio: "11:35", fim: "11:45", label: "INTERVALO" },
  { id: 6, inicio: "11:45", fim: "12:30" },
  { id: 7, inicio: "12:30", fim: "13:15" },
  { id: "intervalo3", inicio: "13:15", fim: "13:30", label: "INTERVALO" },
  { id: 8, inicio: "13:30", fim: "14:15" },
  { id: 9, inicio: "14:15", fim: "15:00" },
];

export const SCHEDULE_DATA: Record<string, Record<string, string[]>> = {
  "Segunda": {
    "1": ["Natalia(Port)", "Ester(Port)", "Alexandre A(Arit)", "Alexandre C(Lit)", "Bianca(Arit)", "Enilda(Gram)", "Cida(Liv)", "Pedro S(Arit)", "Lariany(Port)"],
    "2": ["Natalia(Port)", "Ester(Port)", "Alexandre A(Arit)", "Alexandre C(Lit)", "Bianca(Arit)", "Enilda(Gram)", "Cida(Liv)", "Pedro S(Arit)", "Lariany(Port)"],
    "3": ["Alexandre A(Arit)", "Alexandre C(Lit)", "Natalia(Port)", "Ester(Port)", "Enilda(Gram)", "Bianca(Arit)", "Antonio(Hist)", "Lariany(Red)", "Bianca(Geom)"],
    "4": ["Alexandre A(Arit)", "Alexandre C(Lit)", "Natalia(Port)", "Ester(Port)", "Enilda(Gram)", "Bianca(Arit)", "Antonio(Hist)", "Lariany(Red)", "Bianca(Geom)"],
    "5": ["Cida(Liv)", "Mario(Cien)", "CARENCIA ECO", "Ezequiel(Geo)", "REFORÇO", "Alexandre C(Lit)", "Lariany(Port)", "Natalia(LIT)", "Enilda(Const)"],
    "6": ["Enilda(Gram)", "Alexandre A(Arit)", "Alexandre C(Lit)", "Pedro S(Arit)", "Antonio(Hist)", "Ester(Port)", "Lariany(Port)", "CARENCIA ECO", "Ezequiel(Art)"],
    "7": ["Enilda(Gram)", "Alexandre A(Arit)", "Alexandre C(Lit)", "Pedro S(Arit)", "Antonio(Hist)", "Ester(Port)", "REFORÇO", "Natalia(LIT)", "Ezequiel(Art)"],
    "8": ["Antonio(Hist)", "Ezequiel(Geo)", "Mario(Cien)", "Enilda(Gram)", "Natalia(Port)", "Alexandre C(Lit)", "Genesio(Empr)", "Ester(Port)", "Pedro S(Arit)"],
    "9": ["Antonio(Hist)", "Ezequiel(Geo)", "Mario(Cien)", "Enilda(Gram)", "Natalia(Port)", "Cida(Liv)", "Genesio(Empr)", "Ester(Port)", "Pedro S(Arit)"],
  },
  "Terça": {
    "1": ["Alexandre C(Lit)", "Bianca(Arith)", "Antonio(Hist)", "Ezequiel(Geo)", "Cida(Liv)", "Livison(Ed.Fis)", "Bianca(Arith)", "CARENCIA CIAD", "Pedro S(Arit)"],
    "2": ["Alexandre C(Lit)", "Alexandre A(Algeb)", "Antonio(Hist)", "REFORÇO", "Mario(Cien)", "Carlos(Ing)", "Bianca(Arith)", "Livison(Ed.Fis)", "Pedro S(Arit)"],
    "3": ["Alexandre A(Arith)", "Antonio(Hist)", "Rocha(Mat.Fin)", "Mario(Olimp)", "Genesio(Empre)", "Carlos(Ing)", "Ezequiel(Art)", "Pedro S(Arit)", "Livison(Ed.Fis)"],
    "4": ["Alexandre A(Arith)", "Antonio(Hist)", "Rocha(Mat.Fin)", "Bianca(Geom)", "Genesio(Empre)", "Ezequiel(Geo)", "Carlos(Ing)", "Pedro S(Arit)", "Livison(Ed.Fis)"],
    "5": ["CARENCIA ECO", "Mario(Cien)", "REFORÇO", "Bianca(Geom)", "Alexandre C(Lit)", "Ezequiel(Geo)", "Carlos(Ing)", "Livison(Ed.Fis)", "CARENCIA ECO"],
    "6": ["Ezequiel(Art)", "Rocha(Olimp)", "Alexandre A(Arith)", "Pedro S(Arit)", "Livison(Ed.Fis)", "Bianca(Geom)", "Alexandre C(Lit)", "Carlos(Ing)", "Antonio(Hist)"],
    "7": ["Ezequiel(Art)", "Rocha(Olimp)", "Alexandre A(Arith)", "Pedro S(Arit)", "Livison(Ed.Fis)", "Bianca(Geom)", "Alexandre C(Lit)", "Carlos(Ing)", "Antonio(Hist)"],
    "8": ["Antonio(Geo)", "Ezequiel(Art)", "Rocha(Olimp)", "Genesio(Empre)", "Alexandre C(Lit)", "Pedro S(Arit)", "Mario(Cien)", "Bianca(Geom)", "Carlos(Ing)"],
    "9": ["Antonio(Geo)", "Ezequiel(Art)", "Rocha(Olimp)", "REFORÇO", "Alexandre C(Lit)", "Pedro S(Arit)", "Mario(Cien)", "Bianca(Geom)", "Carlos(Ing)"],
  },
  "Quarta": {
    "1": ["REFORÇO", "Enilda(Gram)", "Ezequiel(Art)", "Livison(Ed.Fis)", "Rocha(Mat.Fin)", "Genesio(Empre)", "Natalia(Port)", "Ester(Port)", "Lariany(Port)"],
    "2": ["REFORÇO", "Enilda(Gram)", "Ezequiel(Art)", "Livison(Ed.Fis)", "Rocha(Mat.Fin)", "Genesio(Empre)", "Natalia(Port)", "Ester(Port)", "Lariany(Port)"],
    "3": ["Lariany(Red)", "Livison(Ed.Fis)", "Enilda(Gram)", "Carlos(Ing)", "Natalia(Port)", "Ester(Port)", "Antonio(Geo)", "Ezequiel(Art)", "Rocha(Olimp)"],
    "4": ["Lariany(Red)", "Livison(Ed.Fis)", "Enilda(Gram)", "Carlos(Ing)", "Natalia(Port)", "Ester(Port)", "Ezequiel(Eco)", "Antonio(Hist)", "Rocha(Olimp)"],
    "5": ["Carlos(Ing)", "REFORÇO", "REFORÇO", "CARENCIA ECO", "Ezequiel(Red)", "Livison(Ed.Fis)", "Lariany(Const)", "Antonio(Hist)", "Enilda(Const)"],
    "6": ["Carlos(Ing)", "Lariany(Red)", "Livison(Ed.Fis)", "Ester(Port)", "Ezequiel(Art)", "Antonio(Hist)", "Enilda(Gram)", "REFORÇO", "Genesio(Empre)"],
    "7": ["Carlos(Rel)", "Lariany(Red)", "Livison(Ed.Fis)", "Ester(Port)", "Ezequiel(Art)", "Antonio(Hist)", "Enilda(Gram)", "REFORÇO", "Genesio(Empre)"],
    "8": ["Natalia(Port)", "Genesio(Empre)", "Carlos(Ing)", "Ezequiel(Art)", "Antonio(Geo)", "REFORÇO", "Rocha(Mat.Fin)", "Enilda(Gram)", "REFORÇO"],
    "9": ["Natalia(Port)", "Genesio(Empre)", "Carlos(Ing)", "Ezequiel(Art)", "Antonio(Geo)", "REFORÇO", "Rocha(Mat.Fin)", "Enilda(Gram)", "REFORÇO"],
  },
  "Quinta": {
    "1": ["Genesio(Empre)", "Ester(Port)", "Natalia(Port)", "Pedro S(Arit)", "Cida(Liv)", "Alexandre A(Olimp)", "Bianca(Arith)", "Rocha(Mat.Fin)", "Lariany(Port)"],
    "2": ["Genesio(Empre)", "Ester(Port)", "Natalia(Port)", "Pedro S(Arit)", "Carlos(Ing)", "Alexandre A(Olimp)", "Bianca(Arith)", "Rocha(Mat.Fin)", "Lariany(Port)"],
    "3": ["Rocha(Mat.Fin)", "Carlos(Ing)", "Alexandre A(Algeb)", "Lariany(Red)", "Bianca(Arith)", "Enilda(Const)", "Natalia(Port)", "Ester(Port)", "Rocha(Olimp)"],
    "4": ["Rocha(Mat.Fin)", "Carlos(Ing)", "Alexandre A(Algeb)", "Lariany(Red)", "Bianca(Arith)", "Enilda(Const)", "Natalia(Port)", "Ester(Port)", "Rocha(Olimp)"],
    "5": ["Bianca(Geom)", "Livison(Eco)", "Ester(Const)", "Enilda(Const)", "Carlos(Ing)", "CARENCIA ECO", "Lariany(Const)", "Mario(Cien)", "Natalia(LIT)"],
    "6": ["Bianca(Geom)", "Enilda(Const)", "Cida(Liv)", "Ester(Port)", "Lariany(Red)", "Rocha(Mat.Fin)", "REFORÇO", "Pedro S(Arit)", "Mario(Cien)"],
    "7": ["Alexandre A(Algeb)", "Enilda(Const)", "Carlos(Rel)", "Ester(Port)", "Lariany(Red)", "Rocha(Mat.Fin)", "Mario(Olimp)", "Pedro S(Arit)", "Natalia(LIT)"],
    "8": ["Alexandre A(Algeb)", "Rocha(Mat.Fin)", "Genesio(Empre)", "Enilda(Const)", "Natalia(Port)", "Pedro S(Arit)", "Carlos(Rel)", "Rocha(Olimp)", "Mario(Cien)"],
    "9": ["Enilda(Const)", "Rocha(Mat.Fin)", "Genesio(Empre)", "REFORÇO", "Natalia(Port)", "Pedro S(Arit)", "Rocha(Olimp)", "Rocha(Olimp)", "Carlos(Rel)"],
  },
  "Sexta": {
    "1": ["Natalia(Port)", "Alexandre A(Algeb)", "Antonio(Geo)", "Mario(Cien)", "Bianca(Algeb)", "Ester(Port)", "Livison(Ed.Fis)", "Lariany(Port)", "Rocha(Mat.Fin)"],
    "2": ["Natalia(Port)", "Alexandre A(Algeb)", "Antonio(Geo)", "Mario(Cien)", "Bianca(Algeb)", "Ester(Port)", "Livison(Ed.Fis)", "Lariany(Port)", "Rocha(Mat.Fin)"],
    "3": ["Rocha(Olimp)", "Ester(Port)", "Natalia(Port)", "Cida(Liv)", "Alexandre A(Olimp)", "Lariany(Red)", "Antonio(Geo)", "Mario(Cien)", "Enilda(Gram)"],
    "4": ["Rocha(Olimp)", "Ester(Port)", "Natalia(Port)", "Antonio(Hist)", "Alexandre A(Olimp)", "Lariany(Red)", "Alexandre A(Algeb)", "Mario(Cien)", "Enilda(Gram)"],
    "5": ["Enilda(Const)", "REFORÇO", "Ester(Const)", "Antonio(Hist)", "Carlos(Rel)", "Carlos(Ing)", "Alexandre A(Algeb)", "Carlos(Rel)", "Cida(Liv)"],
    "6": ["Livison(Ed.Fis)", "Bianca(Geom)", "Lariany(Port)", "Carlos(Rel)", "Ester(Port)", "Mario(Cien)", "Pedro S(Geom)", "Ezequiel(Geo)", "Antonio(Geo)"],
    "7": ["Livison(Ed.Fis)", "Bianca(Geom)", "Lariany(Port)", "Mario(Olimp)", "Ester(Port)", "Carlos(Rel)", "Pedro S(Geom)", "Ezequiel(Geo)", "Antonio(Geo)"],
    "8": ["Mario(Cien)", "Carlos(Rel)", "Bianca(Geom)", "Rocha(Mat.Fin)", "Pedro S(Geom)", "Ezequiel(Art)", "Natalia(Port)", "Genesio(Empre)", "Lariany(Red)"],
    "9": ["Mario(Cien)", "Cida(Liv)", "Bianca(Geom)", "Rocha(Mat.Fin)", "Pedro S(Geom)", "Ezequiel(Art)", "Natalia(Port)", "Genesio(Empre)", "Lariany(Red)"],
  },
};

export const TURMAS_COLS = ["9º A", "9º B", "9º C", "9º D", "9º E", "9º F", "8º A", "8º B", "8º C"];

export function exportToCSV() {
  let csv = "\uFEFFDia,Aula,Horario,Turma,Professor_Materia\n";
  Object.entries(SCHEDULE_DATA).forEach(([dia, aulas]) => {
    Object.entries(aulas).forEach(([aulaNum, turmas]) => {
      const horario = HORARIOS_AULAS.find(h => h.id.toString() === aulaNum);
      turmas.forEach((item, idx) => {
        csv += `${dia},${aulaNum},${horario?.inicio}-${horario?.fim},${TURMAS_COLS[idx]},"${item}"\n`;
      });
    });
  });
  return csv;
}
