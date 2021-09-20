/*global chrome*/

import { useState, useEffect } from 'react';
import { Bar } from "react-chartjs-2";

function getData() {
    const currentDate = new Date().toISOString().substr(0, 10);
    return new Promise((resolve) => {
        chrome.storage.local.get(currentDate, result => {
            return result[currentDate] ? resolve(result[currentDate]) : resolve({});
        });
    });
}

function Chart() {
    const [state, setState] = useState(undefined);

    const UPDATE_MS = 30000;

    async function updateState() {
        let usageData = await getData();

        //const values = Object.values(usageData).map(each => (each / 60).toFixed(2));
        const values = Object.values(usageData).map(each => (each / 60).toFixed(2));
        const currentDate = new Date().toISOString().substr(0, 10);
        console.log("VALUES: " + values);
        setState({
            labels: Object.keys(usageData),
            datasets: [
                {
                    label: `Stats for ${currentDate}`,
                    data: values,
                    backgroundColor: '#f87979',
                    strokeColor: "rgba(220,220,220,0.8)",
                    highlightFill: "rgba(220,220,220,0.75)",
                    highlightStroke: "rgba(220,220,220,1)"
                }
            ]
        });

    }

    useEffect(() => {
        updateState();
        const interval = setInterval(() => {
            updateState();
        }, UPDATE_MS)

        return () => clearInterval(interval);
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        title: {
            display: true,
            text: "Screen Time",
            fontSize: 25,
        },
        scales: {
            xAxes: [
                {
                    scaleLabel: {
                        display: true,
                        labelString: "Sites",
                    },
                    stacked: "true",
                },
            ],
            yAxes: [
                {
                    scaleLabel: {
                        display: true,
                        labelString: "Time Spent",
                    },
                    stacked: "true",
                },
            ],
        },
    };


    return (
        <div>
            <Bar data={state} options={options} />
        </div>
    );
}

export default Chart;