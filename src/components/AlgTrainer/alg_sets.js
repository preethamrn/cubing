import { EquivalentTransformations } from "cubing/kpuzzle"

// def = defition of which pieces to check
function KPuzzleEquivalentChecker(def, t1, t2) {
  const orbits = Object.keys(def) // list of orbits
  for (let i=0; i < orbits.length; i++) {
    let {permutation, orientation} = def[orbits[i]]
    const o1 = t1[orbits[i]]
    const o2 = t2[orbits[i]]
    // permutation check
    for (let j=0; j < permutation.length; j++) {
      if (permutation[j] === 1 && o1.permutation[j] !== o2.permutation[j]) return false
    }
    // orientation check
    for (let j=0; j < orientation.length; j++) {
      if (orientation[j] === 1 && o1.orientation[j] !== o2.orientation[j]) return false   
    }
  }
  return true
}

const ALG_SETS = {
  COLL: {
    list: [{ name: "B1", alg: "R' U' R U' R' U2 R" }, { name: "B2", alg: "R' U' R U' R' U R' D' R U R' D R2" }, { name: "B3", alg: "L R' U' R U L' U2 R' U2 R" }, { name: "B4", alg: "R' U' R U R' F R U R' U' R' F' R2" }, { name: "B5", alg: "R' U L U' R U L'" }, { name: "B6", alg: "R U' R' U2 R U' R' U2 R' D' R U R' D R" }, { name: "C1", alg: "R U R' U R U2 R'" }, { name: "C2", alg: "L' U2 L U2 R U' L' U L R'" }, { name: "C3", alg: "L' R U R' U' L U2 R U2 R'" }, { name: "C4", alg: "R U R' U R U' R D R' U' R D' R2" }, { name: "C5", alg: "R U' L' U R' U' L" }, { name: "C6", alg: "F' R U2 R' U2 R' F2 R U R U' R' F'" }, { name: "D1", alg: "R U2 R' U' R U R' U' R U R' U' R U' R'" }, { name: "D2", alg: "R' U2 R' D' R U2 R' D R2" }, { name: "D3", alg: "R U2 R D R' U2 R D' R2" }, { name: "D4", alg: "x' R U' R' D R U R' D' x" }, { name: "D5", alg: "F' r U R' U' r' F R" }, { name: "D6", alg: "R' U' R U R' F' R U R' U' R' F R2" }, { name: "E1", alg: "R' U' R U' R' U2 R2 U R' U R U2 R'" }, { name: "E2", alg: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R" }, { name: "E3", alg: "R2 D R' U2 R D' R' U2 R'" }, { name: "E4", alg: "F R U' R' U R U R' U R U' R' F'" }, { name: "E5", alg: "R2 D' R U2 R' D R U2 R" }, { name: "E6", alg: "R' U2 R F U' R' U' R U F'" }, { name: "F1", alg: "R U2 R' U' R U' R2 U2 R U R' U R" }, { name: "F2", alg: "R' U R U2 R' L' U R U' L" }, { name: "F3", alg: "l' U' L U R U' r' F" }, { name: "F4", alg: "F R U R' U' R U' R' U' R U R' F'" }, { name: "F5", alg: "r U R' U' r' F R F'" }, { name: "F6", alg: "R' U R2 D r' U2 r D' R2 U' R" }, { name: "G1", alg: "R U2 R2 U' R2 U' R2 U2 R" }, { name: "G2", alg: "R' F2 R U2 R U2 R' F2 U' R U' R'" }, { name: "G3", alg: "R' U' F' R U R' U' R' F R2 U2 R' U2 R" }, { name: "G4", alg: "R U R' U' R' F R2 U R' U' R U R' U' F'" }, { name: "G5", alg: "R U' L' U R' U L U L' U L" }, { name: "G6", alg: "R U D' R U R' D R2 U' R' U' R2 U2 R" }, { name: "H1", alg: "R U R' U R U' R' U R U2 R'" }, { name: "H2", alg: "F R U' R' U R U2 R' U' R U R' U' F'" }, { name: "H3", alg: "R U R' U R U L' U R' U' L" }, { name: "H4", alg: "F R U R' U' R U R' U' R U R' U' F'" }],
    checker: (_, t1, t2) => KPuzzleEquivalentChecker({
      EDGES: {
        permutation: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [1, 1, 1, 1, 1, 1, 1, 1],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1]
      },
      CENTERS: {
        permutation: [1, 1, 1, 1, 1, 1],
        orientation: [0, 0, 0, 0, 0, 0]
      }
    }, t1, t2),
  },
  OLL: {
    list: [{ name: "OLL 1", alg: "R U2 R2 F R F' U2 R' F R F'" }, { name: "OLL 2", alg: "F R U R' U' F' f R U R' U' f'" }, { name: "OLL 3", alg: "f R U R' U' f' U' F R U R' U' F'" }, { name: "OLL 4", alg: "f R U R' U' f' U F R U R' U' F'" }, { name: "OLL 5", alg: "r' U2 R U R' U r" }, { name: "OLL 6", alg: "r U2 R' U' R U' r'" }, { name: "OLL 7", alg: "r U R' U R U2 r'" }, { name: "OLL 8", alg: "r' U' R U' R' U2 r" }, { name: "OLL 9", alg: "R U R' U' R' F R2 U R' U' F'" }, { name: "OLL 10", alg: "R U R' U R' F R F' R U2 R'" }, { name: "OLL 11", alg: "r' R2 U R' U R U2 R' U M'" }, { name: "OLL 12", alg: "F R U R' U' F' U F R U R' U' F'" }, { name: "OLL 13", alg: "r U' r' U' r U r' F' U F" }, { name: "OLL 14", alg: "R' F R U R' F' R F U' F'" }, { name: "OLL 15", alg: "r' U' r R' U' R U r' U r" }, { name: "OLL 16", alg: "r U r' R U R' U' r U' r'" }, { name: "OLL 17", alg: "R U R' U R' F R F' U2 R' F R F'" }, { name: "OLL 18", alg: "r U R' U R U2 r2 U' R U' R' U2 r" }, { name: "OLL 19", alg: "M U R U R' U' M' R' F R F'" }, { name: "OLL 20", alg: "M U R U R' U' M2 U R U' r'" }, { name: "OLL 21", alg: "R U2 R' U' R U R' U' R U' R'" }, { name: "OLL 22", alg: "R U2 R2 U' R2 U' R2 U2 R" }, { name: "OLL 23", alg: "R2 D R' U2 R D' R' U2 R'" }, { name: "OLL 24", alg: "r U R' U' r' F R F'" }, { name: "OLL 25", alg: "F' r U R' U' r' F R" }, { name: "OLL 26", alg: "R U2 R' U' R U' R'" }, { name: "OLL 27", alg: "R U R' U R U2 R'" }, { name: "OLL 28", alg: "r U R' U' M U R U' R'" }, { name: "OLL 29", alg: "M U R U R' U' R' F R F' M'" }, { name: "OLL 30", alg: "F U R U2 R' U' R U2 R' U' F'" }, { name: "OLL 31", alg: "R' U' F U R U' R' F' R" }, { name: "OLL 32", alg: "S R U R' U' R' F R f'" }, { name: "OLL 33", alg: "R U R' U' R' F R F'" }, { name: "OLL 34", alg: "R U R2 U' R' F R U R U' F'" }, { name: "OLL 35", alg: "R U2 R2 F R F' R U2 R'" }, { name: "OLL 36", alg: "L' U' L U' L' U L U L F' L' F" }, { name: "OLL 37", alg: "F R U' R' U' R U R' F'" }, { name: "OLL 38", alg: "R U R' U R U' R' U' R' F R F'" }, { name: "OLL 39", alg: "L F' L' U' L U F U' L'" }, { name: "OLL 40", alg: "R' F R U R' U' F' U R" }, { name: "OLL 41", alg: "R U R' U R U2 R' F R U R' U' F'" }, { name: "OLL 42", alg: "R' U' R U' R' U2 R F R U R' U' F'" }, { name: "OLL 43", alg: "f' L' U' L U f" }, { name: "OLL 44", alg: "f R U R' U' f'" }, { name: "OLL 45", alg: "F R U R' U' F'" }, { name: "OLL 46", alg: "R' U' R' F R F' U R" }, { name: "OLL 47", alg: "F' L' U' L U L' U' L U F" }, { name: "OLL 48", alg: "F R U R' U' R U R' U' F'" }, { name: "OLL 49", alg: "r U' r2 U r2 U r2 U' r" }, { name: "OLL 50", alg: "r' U r2 U' r2 U' r2 U r'" }, { name: "OLL 51", alg: "f R U R' U' R U R' U' f'" }, { name: "OLL 52", alg: "R U R' U R d' R U' R' F'" }, { name: "OLL 53", alg: "r' U' R U' R' U R U' R' U2 r" }, { name: "OLL 54", alg: "r U R' U R U' R' U R U2 r'" }, { name: "OLL 55", alg: "R U2 R2 U' R U' R' U2 F R F'" }, { name: "OLL 56", alg: "r U r' U R U' R' U R U' R' r U' r'" }, { name: "OLL 57", alg: "R U R' U' M' U R U' r'" }],
    checker: (_, t1, t2) => KPuzzleEquivalentChecker({
      EDGES: {
        permutation: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [0, 0, 0, 0, 1, 1, 1, 1],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1]
      },
      CENTERS: {
        permutation: [1, 1, 1, 1, 1, 1],
        orientation: [0, 0, 0, 0, 0, 0]
      }
    }, t1, t2),
  },
  PLL: {
    list: [{ name: "Aa", alg: "l' U R' D2 R U' R' D2 R2 x'" }, { name: "Ab", alg: "l' R' D2 R U R' D2 R U' R x'" }, { name: "E", alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x" }, { name: "F", alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" }, { name: "Ga", alg: "R2 u R' U R' U' R u' R2 y' R' U R y" }, { name: "Gb", alg: "R' U' R D' U R2 U R' U R U' R U' R2 D" }, { name: "Gc", alg: "R2 F2 R U2 R U2 R' F R U R' U' R' F R2" }, { name: "Gd", alg: "R U R' D U' R2 U' R U' R' U R' U R2 D'" }, { name: "H", alg: "M2 U' M2 U2 M2 U' M2" }, { name: "Ja", alg: "L' U2 L U L' U2 R U' L U R'" }, { name: "Jb", alg: "R U R' F' R U R' U' R' F R2 U' R'" }, { name: "Na", alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" }, { name: "Nb", alg: "R' U L' U2 R U' L R' U L' U2 R U' L" }, { name: "Ra", alg: "R U2 R' U2 R B' R' U' R U R B R2" }, { name: "Rb", alg: "R' U2 R U2 R' F R U R' U' R' F' R2" }, { name: "T", alg: "R U R' U' R' F R2 U' R' U' R U R' F'" }, { name: "Ua", alg: "R U' R U R U R U' R' U' R2" }, { name: "Ub", alg: "R2 U R U R' U' R' U' R' U R'" }, { name: "V", alg: "z D' R2 D R2 U R' D' R U' R U R' D R U' z'" }, { name: "Y", alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'" }, { name: "Z", alg: "M2 U' M2 U' M' U2 M2 U2 M'" }],
    checker: EquivalentTransformations,
  },
  TEST1: {
    list: [{name: "AA", alg: "y x R2 r L x z L' r2 U F B l' x'"}, {name: "MM", alg: "R U R' U' M' U R U' r'"}, {name: "AB", alg: "u R2 r L x z L' r2 U F B l' x'"},  {name: "AC", alg: "y x R2 x x z x2 x' x'"}, {name: "test", alg: "R y x"}, {name: "test", alg: "x y R"}, {name: "test", alg: "x y z R"},  {name: "test", alg: "y' R y'"}, {name: "test", alg: "x' R x'"}, {name: "test", alg: "z' R z'"},  {name: "test", alg: "y x R x"}, {name: "test", alg: "x R"}, {name: "test", alg: "z R"}],
    checker: EquivalentTransformations,
  },
  TEST2: {
    list: [{ name: "Z", alg: "R U R' U'" }, { name: "H", alg: "R U R' U'" }],
    checker: EquivalentTransformations,
  },
}

export {ALG_SETS}
