const express = require("express");
const cors = require("cors");
const { Faker, en_US, pl, uk, sk } = require("@faker-js/faker");

const app = express();
const PORT = "https://task-5-4uqz.onrender.com" || 8080;
app.use(cors());
app.use(express.json());

let globalIdCounter = 0;

// Фиксированный генератор случайных чисел
const RandomGenerator = (seed) => {
  let m = 0x80000000; // 2 ** 31
  let a = 1103515245; // 'a' constant
  let c = 12345; // 'c' constant
  let state = seed;

  return () => {
    state = (a * state + c) % m;
    return state / m; // Вернуть число от 0 до 1
  };
};

const addErrorsToString = (str, errorCount, rng) => {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const errors = Array.from({ length: Math.floor(errorCount) }, () => {
    const errorType = Math.floor(rng() * 3);
    const pos = Math.floor(rng() * str.length);

    if (errorType === 0 && str.length > 0) {
      return str.slice(0, pos) + str.slice(pos + 1);
    } else if (errorType === 1) {
      const randomChar = alphabet.charAt(Math.floor(rng() * alphabet.length));
      return str.slice(0, pos) + randomChar + str.slice(pos);
    } else if (errorType === 2 && pos > 0) {
      const char = str[pos];
      return str.slice(0, pos - 1) + char + str[pos - 1] + str.slice(pos + 1);
    }
    return str;
  });
  return errors.reduce((acc, curr) => curr, str);
};

const generateLocalizedFaker = (region) => {
  switch (region) {
    case "ua":
      return new Faker({ locale: [uk] });
    case "pl":
      return new Faker({ locale: [pl] });
    default:
      return new Faker({ locale: [sk] });
  }
};

app.get("/generate", (req, res) => {
  const { region, errorCount, seed, page } = req.query;
  const recordsPerPage = 20;
  const additionalRecords = 10;
  const records = [];

  if (page === "1") {
    globalIdCounter = 0;
  }

  const effectiveSeed = parseInt(seed) + (parseInt(page) - 1);
  const faker = generateLocalizedFaker(region);
  faker.seed(effectiveSeed);

  const rng = RandomGenerator(effectiveSeed);

  const numberOfRecords =
    parseInt(page) === 1 ? recordsPerPage : additionalRecords;

  for (let i = 0; i < numberOfRecords; i++) {
    globalIdCounter++;
    const fullName = faker.person.fullName();
    const address = `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.zipCode()}`;
    const phone = faker.phone.number();

    const record = {
      id: globalIdCounter,
      randomId: faker.string.uuid(),
      fullName: addErrorsToString(fullName, errorCount, rng),
      address: addErrorsToString(address, errorCount, rng),
      phone: addErrorsToString(phone, errorCount, rng),
      country: faker.location.country(),
    };

    records.push(record);
  }

  res.json(records);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
