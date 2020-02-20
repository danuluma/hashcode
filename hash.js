const fs = require("fs");
const reader = require("readline");
const path = require("path");

const directoryPath = path.join(__dirname, "");
let input = [];

try {
  input = fs
    .readdirSync(directoryPath)
    .filter(file => /^(\w{1}_)/.test(file))
    .map(file => file.split(".txt")[0]);
} catch (error) {
  console.log("Cant read dir. Msg:", error);
}

console.log(input);

// const input = [
//   "a_example",
//   "b_read_on",
//   "c_incunabula",
//   "d_tough_choices",
//   "e_so_many_books",
//   "f_libraries_of_the_world"
// ];

class Library {
  constructor(data) {
    this.libNo = data.libNo;
    this.libBooks = parseInt(data.libdata[0]);
    this.signup = parseInt(data.libdata[1]);
    this.ship = parseInt(data.libdata[2]);
    this.bookIds = data.bookIds;
    this.toCount = [];
  }
}

class Libraries {
  constructor() {
    this.books = 0;
    this.libcount = 0;
    this.days = 0;
    this.libs = [];
    this.scores = [];
    this.bookIdsSet = [];
    this.counted = [];
  }

  setLibVals = ({ ...vals }) => {
    this.books = parseInt(vals[0]);
    this.libcount = parseInt(vals[1]);
    this.days = parseInt(vals[2]);
  };

  addLib = (libNo, libdata, bookIds) => {
    this.bookIdsSet = [...new Set([...this.bookIdsSet, ...bookIds])];
    const lib = new Library({ libNo, libdata, bookIds });
    this.libs.push(lib);
  };

  setBookScores = vals => {
    this.scores = vals;
  };

  addCounted = vals => {
    this.counted = [...this.counted, ...vals];
  };

  sortLibs = () => {
    this.libs.sort((a, b) => {
      if (b.ship == a.ship) {
        return a.signup - b.signup;
      }
      return b.ship - a.ship;
    });
  };
}

const readLibData = (libraries, line) => {
  const values = line.split(" ");
  libraries.setLibVals(values);
};

const bookScores = (libraries, line) => {
  libraries.setBookScores(line.split(" "));
};

const assignCounts = libraries => {
  libraries.sortLibs();
  libraries.libs.map(lib => {
    let { counted } = libraries;
    const valid = lib.bookIds.filter(id => !counted.includes(id));
    lib.toCount = valid;
    libraries.addCounted(valid);
  });
};

const calcScore = libs => {
  const { counted, scores } = libs;
  const maScore = counted.map(c => parseInt(scores[parseInt(c)]));
  const ssum = maScore.reduce((a, b) => (a += b), 0);
  console.log(`Max score possible: ${ssum}`);
};

const work = (libraries, currfile) => {
  assignCounts(libraries);
  let sdays = 0;
  let slibs = [];
  //   console.log(libraries.libs);
  libraries.libs.forEach(lib => {
    const { days } = libraries;
    if (sdays + parseInt(lib.signup) <= days) {
      sdays += parseInt(lib.signup);
      slibs.push(lib);
    }
  });
  let out = `${slibs.length}\n`;

  slibs.map(lib => {
    // console.log(slibs);
    out += `${lib.libNo} ${lib.toCount.length}\n`;
    out += `${lib.toCount.join(" ")}\n`;
  });
  // console.log(libraries, currfile, out);
  fs.writeFile(
    path.format({ root: `${directoryPath}/`, base: `output_${currfile}.txt` }),
    out,
    () => {}
  );
};

input.forEach((file, i) => {
  //   console.log("heyy");
  let libraries;
  let count = 0;
  let libLineCount = 0;
  let libNo = 0;
  let libdata;
  const lineReader = reader.createInterface({
    input: fs.createReadStream(
      path.format({ root: `${directoryPath}/`, base: `${file}.txt` })
    )
  });

  lineReader.on("line", line => {
    if (count === 0) {
      libraries = new Libraries();
      readLibData(libraries, line);
    } else if (count === 1) {
      bookScores(libraries, line);
    } else {
      //   libsData(libraries, line, libLineCount);
      if (libLineCount % 2 == 0) {
        libdata = line.split(" ");
      } else {
        libraries.addLib(libNo, libdata, line.split(" "));
        libNo++;
      }
      libLineCount++;
    }
    count++;
  });

  lineReader.on("pause", () => {
    console.log("File", file, "Count", i);
    work(libraries, file);
    calcScore(libraries);
    // lineReader.resume();
  });
});
