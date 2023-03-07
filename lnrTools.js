export class SmartConnectClient {
  constructor({alias, rootOrgId, username, password} = {}) {
    this.defaults = {};

    if (alias !== undefined && rootOrgId !== undefined) {
      this.defaults.companyid = rootOrgId;
      this.defaults.alias = alias;
      this.url = `https://${alias}.grants.tn.gov`;
      console.log(this.url);
    } else {
      this.url = '';
    }

    if (username !== undefined && password !== undefined) {
      this.defaults.username = username;
      this.defaults.password = password;
    }
  }

  #ssEndpoints = {
    report: '/API/2/report/',
    company: '/API/2/company/',
    user: '/API/2/user/',
    systemVariables: '/API/2/sysvar/',
    level1: '/API/2/levelone/',
    level2: '/API/2/leveltwo/',
    level3: '/API/2/levelthree/',
    transaction: '/API/2/transactions/',
    functions: '/API/2/functions/',
  };

  async #sendData(endpoint, token, parameters) {
    const merged = { ...this.defaults, ...parameters };
    merged.apitoken = token;
    if (merged.criteria !== undefined) merged.criteria = JSON.stringify(merged.criteria);
    if (merged.sortby !== undefined) merged.sortby = JSON.stringify(merged.sortby);
    if (merged.jsonrset !== undefined) merged.jsonrset = JSON.stringify(merged.jsonrset);
    endpoint = `${this.url}${endpoint}`;
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Request: ${JSON.stringify(merged)}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(merged),
    });

    const responseJson = await response.json();
    console.log(`Response: ${JSON.stringify(responseJson)}`);
    return responseJson;
  }

  async #getLevelRecord(level, token, recordid) {
    const params = {
      recordid,
    };
    return await this.#sendData(level, token, params);
  }

  async getL1Record(token, recordid) {
    return await this.#getLevelRecord(this.#ssEndpoints.level1, token, recordid);
  }

  async getL2Record(token, recordid) {
    return await this.#getLevelRecord(this.#ssEndpoints.level2, token, recordid);
  }

  async getL3Record(token, recordid) {
    return await this.#getLevelRecord(this.#ssEndpoints.level3, token, recordid);
  }

  async #listRecords(endpoint, token, parameters) {
    return await this.#sendData(endpoint, token, parameters);
  }

  async listL1Records(token, parameters = {}) {
    return await this.#listRecords(this.#ssEndpoints.level1, token, parameters);
  }

  async listL2Records(token, parameters = {}) {
    return await this.#listRecords(this.#ssEndpoints.level2, token, parameters);
  }

  async listL3Records(token, parameters = {}) {
    return await this.#listRecords(this.#ssEndpoints.level3, token, parameters);
  }

  async #updateRecord(endpoint, token, fieldData) {
    const merged = {
      jsonrset: [
        {
          ...fieldData,
        },
      ],
    };
    return await this.#sendData(endpoint, token, merged);
  }

  async updateL1Record(token, fieldData) {
    return await this.#updateRecord(this.#ssEndpoints.level1, token, fieldData);
  }

  async updateL2Record(token, fieldData) {
    return await this.#updateRecord(this.#ssEndpoints.level2, token, fieldData);
  }

  async updateL3Record(token, fieldData) {
    return await this.#updateRecord(this.#ssEndpoints.level3, token, fieldData);
  }

  async createProviderConsumer(token, rolename, consumerid, providerid) {
    const newRecord = {
      jsonrset: [
        {
          recordid: '0',
          rolename,
          consumerid,
          providerid,
        },
      ],
    };
    return await this.#sendData(this.#ssEndpoints.level1, token, newRecord);
  }

  async #listConsumersToLevelProvider(level, token, providerid, criteria) {
    const parameters = {
      criteria: [
        {
          andor: '(',
          field: 'providerid',
          operator: '=',
          value: providerid,
        },
        ...criteria,
      ],
    };
    return await this.#sendData(level, token, parameters);
  }

  async listConsumersToL1Provider(token, providerid, criteria = []) {
    return await this.#listConsumersToLevelProvider(this.#ssEndpoints.level1, token, providerid, criteria);
  }

  async listConsumersToL2Provider(token, providerid, criteria = []) {
    return await this.#listConsumersToLevelProvider(this.#ssEndpoints.level2, token, providerid, criteria);
  }

  async listConsumersToL3Provider(token, providerid, criteria = []) {
    return await this.#listConsumersToLevelProvider(this.#ssEndpoints.level3, token, providerid, criteria);
  }

  async #listLevelProvidersToConsumer(level, token, consumerid, criteria) {
    const parameters = {
      criteria: [
        {
          andor: '(',
          field: 'consumerid',
          operator: '=',
          value: consumerid,
        },
        ...criteria,
      ],
    };
    return await this.#sendData(level, token, parameters);
  }

  async listL1ProvidersToConsumer(token, consumerid, criteria = []) {
    return await this.#listLevelProvidersToConsumer(this.#ssEndpoints.level1, token, consumerid, criteria);
  }

  async listL2ProvidersToConsumer(token, consumerid, criteria = []) {
    return await this.#listLevelProvidersToConsumer(this.#ssEndpoints.level2, token, consumerid, criteria);
  }

  async listL3ProvidersToConsumer(token, consumerid, criteria = []) {
    return await this.#listLevelProvidersToConsumer(this.#ssEndpoints.level3, token, consumerid, criteria);
  }
}

export class Formatter {
  static numToWords(numericalRepresentation) {
    numericalRepresentation = numericalRepresentation.trim().replace(/\$|,/g, '');
    numericalRepresentation = Number.parseFloat(numericalRepresentation);
    if (Number.isNaN(numericalRepresentation)) {
      throw new Error("Input must be a valid number.");
    }
    if (numericalRepresentation < 0) {
      throw new Error("Cannot convert negative value.");
    }
  
    let dollarPart = 0;
    let centPart = 0;
  
    if (Number.isInteger(numericalRepresentation)) {
      dollarPart = numericalRepresentation;
    } else {
      const numberAsString = numericalRepresentation.toString();
      let [dollarString, centString] = numberAsString.split(".");
  
      dollarPart = Number.parseInt(dollarString);
  
      centString =
        centString.length > 1
          ? `${centString[0]}${centString[1]}`
          : `${centString}0`;
      centPart = Number.parseInt(centString);
    }
  
    return `${Formatter.#convertIntegerValue(dollarPart)} Dollars and ${Formatter.#convertIntegerValue(centPart)} Cents`;
  }
  
  static monthsAndDays(beginDate, endDate) {
    function calcMonthsAndDays(begin, end) {
      begin = new Date(begin);
      end = new Date(end);
      const years = end.getFullYear() - begin.getFullYear();
      const months = end.getMonth() - begin.getMonth();
      let days = end.getDate() - begin.getDate();
      let totalMonths = years * 12 + months;
      if (days < 0) {
        days = begin.getDate() + days;
        totalMonths--;
      }
      let text = `${Formatter.#convertIntegerValue(totalMonths)} Months`;
      if (days > 0) text = `${text} and ${Formatter.#convertIntegerValue(days)} Days`;
  
      return {
        months: totalMonths,
        days,
        text
      }
    }
  
    const begin = new Date(`${beginDate}T12:00:00`);
    const end = new Date(`${endDate}T12:00:00`);
    const daysPlusOne = calcMonthsAndDays(begin, new Date(end).setDate(end.getDate() + 1));
    if (daysPlusOne.days === 0) return daysPlusOne;
    return calcMonthsAndDays(begin, end);
  }
  
  static #convertIntegerValue(numericalRepresentation) {
    if (numericalRepresentation === 0) {
      return "Zero";
    } else if (numericalRepresentation < 10) {
      return Formatter.#convertIntegerValueLessThan10(numericalRepresentation);
    } else if (numericalRepresentation < 20) {
      return Formatter.#convertIntegerValueLessThan20(numericalRepresentation);
    } else if (numericalRepresentation < 100) {
      return Formatter.#convertIntegerValueGreaterThan20AndLessThan100(
        numericalRepresentation
      );
    } else {
      return Formatter.#convertValue100AndOver(numericalRepresentation);
    }
  }
  
  static #convertIntegerValueLessThan10(digit) {
    switch (digit) {
      case 1:
        return "One";
      case 2:
        return "Two";
      case 3:
        return "Three";
      case 4:
        return "Four";
      case 5:
        return "Five";
      case 6:
        return "Six";
      case 7:
        return "Seven";
      case 8:
        return "Eight";
      case 9:
        return "Nine";
    }
  }
  
  static #convertIntegerValueLessThan20(numericalRepresentation) {
    switch (numericalRepresentation) {
      case 10:
        return "Ten";
      case 11:
        return "Eleven";
      case 12:
        return "Twelve";
      case 13:
        return "Thirteen";
      case 14:
        return "Fourteen";
      case 15:
        return "Fifteen";
      case 16:
        return "Sixteen";
      case 17:
        return "Seventeen";
      case 18:
        return "Eighteen";
      case 19:
        return "Nineteen";
    }
  }
  
  static #convertIntegerValueGreaterThan20AndLessThan100(
    numericalRepresentation
  ) {
    let valueInWords = "";
    if (numericalRepresentation < 30) {
      valueInWords = "Twenty";
    } else if (numericalRepresentation < 40) {
      valueInWords = "Thirty";
    } else if (numericalRepresentation < 50) {
      valueInWords = "Fourty";
    } else if (numericalRepresentation < 60) {
      valueInWords = "Fifty";
    } else if (numericalRepresentation < 70) {
      valueInWords = "Sixty";
    } else if (numericalRepresentation < 80) {
      valueInWords = "Seventy";
    } else if (numericalRepresentation < 90) {
      valueInWords = "Eighty";
    } else {
      valueInWords = "Ninety";
    }
  
    const remainder = numericalRepresentation % 10;
    if (remainder > 0) {
      valueInWords += `-${Formatter.#convertIntegerValueLessThan10(remainder)}`;
    }
    return valueInWords;
  }
  
  static #convertValue100AndOver(numericalRepresentation) {
    const HUNDRED = "Hundred";
    const THOUSAND = "Thousand";
    const MILLION = "Million";
    const BILLION = "Billion";
    const TRILLION = "Trillion";
    const QUADRILLION = "Quadrillion";
  
    const ONE_HUNDRED = 100;
    const ONE_THOUSAND = 1000;
    const ONE_MILLION = 1000000;
    const ONE_BILLION = 1000000000;
    const ONE_TRILLION = 1000000000000;
    const ONE_QUADRILLION = 1000000000000000;
  
    const suffix = {
      [HUNDRED]: ONE_HUNDRED,
      [THOUSAND]: ONE_THOUSAND,
      [MILLION]: ONE_MILLION,
      [BILLION]: ONE_BILLION,
      [TRILLION]: ONE_TRILLION,
      [QUADRILLION]: ONE_QUADRILLION,
    };
  
    let scale;
    if (numericalRepresentation < ONE_THOUSAND) {
      scale = HUNDRED;
    } else if (numericalRepresentation < ONE_MILLION) {
      scale = THOUSAND;
    } else if (numericalRepresentation < ONE_BILLION) {
      scale = MILLION;
    } else if (numericalRepresentation < ONE_TRILLION) {
      scale = BILLION;
    } else if (numericalRepresentation < ONE_QUADRILLION) {
      scale = TRILLION;
    } else {
      scale = QUADRILLION;
    }
  
    let valueInWords = `${Formatter.#convertIntegerValue(
      Math.floor(numericalRepresentation / suffix[scale])
    )} ${scale}`;
    const remainder = numericalRepresentation % suffix[scale];
    if (remainder > 0) {
      if (remainder < 100) {
        valueInWords += ` and ${Formatter.#convertIntegerValue(remainder)}`;
      } else {
        valueInWords += `, ${Formatter.#convertIntegerValue(remainder)}`;
      }
    }
    return valueInWords;
  }
}
