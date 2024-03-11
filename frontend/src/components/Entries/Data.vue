<template>
  <div>
    <canvas id="count-by-workstation"></canvas>
    <canvas id="count-by-hour"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'
import { getEntries } from '@/api/entries.api';

export default {
  name: 'Data',
  data() {
    return {
      count_by_workstation_data: null
    }
  },
  async mounted() {
    this.data = [];

    const {data} = await getEntries();
    console.log(data);

    const workstation_data = new Map();
    const hour_data = new Map();

    for(const val of data) {
      if(workstation_data.get(val.workstationId)) {
        let data = workstation_data.get(val.workstationId);
        data.count++;
        workstation_data.set(val.workstationId, data);
      } else {
        workstation_data.set(val.workstationId, {workstation: val.workstation, count: 1});
      }
    }

    let intervals = [];
    for(let i = 9; i <= 20; i++) {
      let intervalStart = new Date();
      intervalStart.setHours(i);
      intervalStart.setMinutes(0);
      intervalStart.setSeconds(0);
      intervalStart.setMilliseconds(0);
      intervals.push(intervalStart);
    }

    let time_data = intervals.map(intervalStart => {
      return {
        time_interval: intervalStart,
        count: data.reduce((acc, curr) => {

          let closedAt = curr.closedAt.split(':');
          let createdAt = new Date(curr.createdAt);
          let closed_date = new Date();
          closed_date.setHours(closedAt[0]);
          closed_date.setMinutes(closedAt[1]);
          closed_date.setSeconds(closedAt[2]);

          let created_date = new Date();
          created_date.setHours(createdAt.getHours());
          created_date.setMinutes(createdAt.getMinutes());
          created_date.setSeconds(createdAt.getSeconds());

          let intervalEnd = new Date(intervalStart);
          intervalEnd.setHours(intervalEnd.getHours() + 1);

          if(created_date < intervalEnd && closed_date >= intervalEnd) {
            return acc + 1;
          }
          return acc;
        }, 0)
      }
    });

    workstation_data.forEach((value, key) => {
      if(key === null) {
        workstation_data.delete(key);
      }
    });

    const sortedWorkstationData = new Map([...workstation_data.entries()].sort((a, b) => a[0] - b[0]));

    this.count_by_workstation_data = {
      type: "line",
      data: {
        labels: Array.from(sortedWorkstationData.values()).map(entry => entry.workstation.name),
        datasets: [
          {
            label: "Total number of users in pc",
            data: Array.from(sortedWorkstationData.values()).map(entry => entry.count),
            backgroundColor: "rgba(54,73,93,.5)",
            borderColor: "#36495d",
            borderWidth: 3
          },
        ]
      },
      options: {
        responsive: true,
        lineTension: 1,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                padding: 25
              }
            }
          ]
        }
      }
    };

    this.count_by_hour_data = {
      type: "line",
      data: {
        labels: time_data.map(entry => `${entry.time_interval.toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}`),
        datasets: [
          {
            label: "Total number of users in pc",
            data: time_data.map(entry => entry.count),
            backgroundColor: "rgba(54,73,93,.5)",
            borderColor: "#36495d",
            borderWidth: 3
          },
        ]
      },
      options: {
        responsive: true,
        lineTension: 1,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                padding: 25
              }
            }
          ]
        }
      }
    };
    const ctx_1 = document.getElementById('count-by-workstation');
    new Chart(ctx_1, this.count_by_workstation_data);

    const ctx_2 = document.getElementById('count-by-hour');
    new Chart(ctx_2, this.count_by_hour_data);
  }
}
</script>
