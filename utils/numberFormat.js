const numberFormat = (number) => {
  const formatNumbering = new Intl.NumberFormat("id-ID");
  return formatNumbering.format(number);
};

const namesOfMonth = (localeName = "en-US", monthFormat = "long") => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...Array(12).keys()].map((m) => format(new Date(Date.UTC(2022, m))));
};

const namesOfMonthLocal = (localeName = "id-ID", monthFormat = "long") => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...Array(12).keys()].map((m) => format(new Date(Date.UTC(2022, m))));
};

const namesSetMonth = (indeks, zona) => {
  let arrayMonthLocal = namesOfMonthLocal();
  let arrayMonth = namesOfMonth();
  let bulan = "";
  if (zona === "en-US") {
    arrayMonth.forEach((el, i) => {
      if (i === indeks) {
        bulan = el;
      }
    });
  } else {
    arrayMonthLocal.forEach((el, i) => {
      if (i === indeks) {
        bulan = el;
      }
    });
  }
  return bulan;
};

const setIndeksHours = (hours) => {
  if (hours.length === 1) {
    return `0${hours}`;
  } else {
    return `${hours}`;
  }
};

const returnFormatDate = () => {
  let bulan = new Date().getMonth();
  let tahun = new Date().getFullYear();
  let tanggal = new Date().getDate();
  let jam = new Date().getHours();
  let menit = new Date().getMinutes();
  let tanggalKirim = `${tanggal} ${namesSetMonth(bulan, "id-ID")} ${tahun}`;
  let jamKirim = `${setIndeksHours(jam.toString())}:${setIndeksHours(menit.toString())}`;

  return { tanggalKirim, jamKirim };
};
module.exports = { numberFormat, namesOfMonth, namesOfMonthLocal, namesSetMonth, setIndeksHours, returnFormatDate };
