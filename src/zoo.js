const data = require('./data');

function getSpeciesByIds(...ids) {
  return data.species.filter((specie) => ids.includes(specie.id));
}

function getAnimalsOlderThan(animal, age) {
  const getAnimals = data.species.find((specie) => specie.name === animal);
  return getAnimals.residents.every((animalAge) => animalAge.age >= age);
}

function getEmployeeByName(employeeName) {
  const emp = data.employees;
  if (employeeName === undefined) {
    return {};
  }
  return emp.find((em) => (em.firstName === employeeName || em.lastName === employeeName));
}

function createEmployee(personalInfo, associatedWith) {
  return { ...personalInfo, ...associatedWith,
  };
}

function isManager(id) {
  return data.employees.some((employee) => employee.managers.includes(id));
}

function addEmployee(id, firstName, lastName, managers = [], responsibleFor = []) {
  const employee = {
    id,
    firstName,
    lastName,
    managers,
    responsibleFor,
  };
  data.employees.push(employee);
}

function countAnimals(species) {
  const animalsList = {};
  data.species.forEach((specie) => {
    animalsList[specie.name] = specie.residents.length;
    return undefined;
  });
  if (species === undefined) {
    return animalsList;
  }
  return animalsList[species];
}

function calculateEntry(entrants) {
  const { prices: costs } = data;
  if (typeof (entrants) === 'undefined') {
    return 0;
  }

  if (typeof (entrants) === 'object') {
    if (Object.keys(entrants).length < 1) {
      return 0;
    }
    return Object.keys(entrants).reduce((sum, age) => (costs[age] * entrants[age]) + sum, 0);
  }
}

const getResidents = (specie) => {
  const { species } = data;
  return species.find((sp2) => sp2.name === specie).residents.map((res) => res.name);
};

const getResidentsWithSex = (specie, sex) => {
  const { species } = data;
  const speciesFind = species.find((sp2) => sp2.name === specie);
  return speciesFind.residents.filter((rs) => rs.sex === sex).map((rs) => rs.name);
};

const includeNamesTrue = () => {
  const regions = ['NE', 'NW', 'SE', 'SW'];
  const ans = regions.reduce((acc, act) => {
    acc[act] = data.species.filter((specie) => specie.location === act).map((specie) => {
      const { name } = specie;
      const ans2 = {};
      ans2[name] = getResidents(name);
      return ans2;
    });
    return acc;
  }, {});
  return ans;
};

const sort = () => {
  const regions = ['NE', 'NW', 'SE', 'SW'];
  const ans = regions.reduce((acc, act) => {
    acc[act] = data.species.filter((specie) => specie.location === act).map((specie) => {
      const { name } = specie;
      const ans2 = {};
      ans2[name] = getResidents(name).sort();
      return ans2;
    });
    return acc;
  }, {});
  return ans;
};

const sexFilter = (sex) => {
  const regions = ['NE', 'NW', 'SE', 'SW'];
  const ans = regions.reduce((acc, act) => {
    acc[act] = data.species.filter((specie) => specie.location === act).map((specie) => {
      const { name } = specie;
      const ans2 = {};
      ans2[name] = getResidentsWithSex(name, sex);
      return ans2;
    });
    return acc;
  }, {});
  return ans;
};

const sexFilterPlusSort = (sex) => {
  const regions = ['NE', 'NW', 'SE', 'SW'];
  const ans = regions.reduce((acc, act) => {
    acc[act] = data.species.filter((specie) => specie.location === act).map((specie) => {
      const { name } = specie;
      const ans2 = {};
      ans2[name] = getResidentsWithSex(name, sex).sort();
      return ans2;
    });
    return acc;
  }, {});
  return ans;
};

const filtersChoose = (options) => {
  let ans = includeNamesTrue();
  const { sorted = false, sex = undefined } = options;
  if (sorted) {
    ans = sort();
  }
  if (sex !== undefined) {
    ans = sexFilter(sex);
  }
  if (sex !== undefined && sorted) {
    ans = sexFilterPlusSort(sex);
  }
  return ans;
};

function getAnimalMap(options) {
  const { species } = data;
  const regions = ['NE', 'NW', 'SE', 'SW'];
  const ans = regions.reduce((acc, act) => {
    acc[act] = species.filter((specie) => specie.location === act).map((specie) => specie.name);
    return acc;
  }, {});
  if (typeof (options) === 'object') {
    const { includeNames = false } = options;
    if (includeNames) {
      return filtersChoose(options);
    }
  }
  return ans;
}

function getSchedule(dayName) {
  const { hours } = data;
  const ans = Object.keys(hours).reduce((acc, act) => {
    const check = (typeof (dayName) === 'undefined') ? act : dayName;
    const stockMsg = `Open from ${hours[check].open}am until ${hours[check].close - 12}pm`;
    acc[check] = stockMsg;
    return acc;
  }, {});
  if (Object.keys(ans).includes('Monday')) {
    ans.Monday = 'CLOSED';
  }
  return ans;
}

function getOldestFromFirstSpecies(id) {
  const person = data.employees.find((employee) => employee.id === id);
  const firstSpecie = data.species.find((specie) => specie.id === person.responsibleFor[0]);
  const ageChk = firstSpecie.residents.reduce((acc, act) => ((act.age > acc) ? act.age : acc), 0);
  return Object.values(firstSpecie.residents.find((animal) => animal.age === ageChk));
}

function increasePrices(percentage) {
  const { prices: pr } = data;
  const rnd = (number) => Math.round(number * (1 + percentage / 100) * 100) / 100;
  data.prices = Object.keys(pr).reduce((acc, age) => { acc[age] = rnd(pr[age]); return acc; }, {});
}

const convertAnimalIdIntoName = (id) => data.species.find((specie) => id === specie.id).name;

const checkInputType = (input) => {
  const allEmployees = {
    id: data.employees.map((employee) => employee.id),
    firstName: data.employees.map((employee) => employee.firstName),
    lastName: data.employees.map((employee) => employee.lastName),
  };
  const typeList = Object.values(allEmployees).find((personInfo) => personInfo.includes(input));
  const inputType = Object.keys(allEmployees).find((key) => allEmployees[key] === typeList);
  const personFn = data.employees.find((employee) => employee[inputType] === input).firstName;
  const personLn = data.employees.find((employee) => employee[inputType] === input).lastName;
  const personAnimalsIds = data.employees.find((emp) => emp[inputType] === input).responsibleFor;
  const personAnimals = personAnimalsIds.map((id) => convertAnimalIdIntoName(id));
  return {
    firstName: personFn,
    lastName: personLn,
    responsibleFor: personAnimals,
  };
};

function getEmployeeCoverage(idOrName) {
  const list = {};
  const person = checkInputType(idOrName);
  if (typeof (idOrName) === 'undefined') {
    data.employees.forEach((employee) => {
      const fn = employee.firstName;
      const ln = employee.lastName;
      list[`${fn} ${ln}`] = employee.responsibleFor.map((id) => convertAnimalIdIntoName(id));
    });
  } else {
    list[`${person.firstName} ${person.lastName}`] = person.responsibleFor;
  }
  return list;
}

module.exports = {
  calculateEntry,
  getSchedule,
  countAnimals,
  getAnimalMap,
  getSpeciesByIds,
  getEmployeeByName,
  getEmployeeCoverage,
  addEmployee,
  isManager,
  getAnimalsOlderThan,
  getOldestFromFirstSpecies,
  increasePrices,
  createEmployee,
};
