import React, { useEffect, useState } from "react";

export default function CountDownEnd() {
  const [timeTotal, setTimeTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeNow, setTimeNow] = useState(0);

  useEffect(() => {
    let id = setInterval(() => {
      let dayIni = new Date("06/17/2021");
      let dayEnd = new Date("12/31/2021");
      let now = new Date();
      const calculateTime = (d1, d2) => Math.abs(d1 - d2) / (1000 * 3600 * 24);

      setTimeLeft(calculateTime(dayEnd, now));
      setTimeNow(calculateTime(now, dayIni));
      setTimeTotal(calculateTime(dayEnd, dayIni));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [timeTotal, timeLeft, timeNow]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Total</th>
            <th>Transcurridos</th>
            <th>Restante</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{timeTotal}</td>
            <td>{timeNow.toFixed(5)}</td>
            <td>{timeLeft.toFixed(5)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
