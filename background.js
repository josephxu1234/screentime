const urls = [
    '*://*.facebook.com/',
    '*://*.twitter.com/',
    '*://*.youtube.com/',
    '*://*.instagram.com/'
]
// keep track of the active tab
// properties:
// time: start time of the active tab
// host: name of the active tab host
let active = {};

// chrome local storage
const STORAGE = chrome.storage.local;

// key will be current date, data is a dictionary mapping host : seconds
const update = async (host, seconds) => {
    const currentDate = new Date().toISOString().substr(0, 10);
    // get the data saved for the current date
    const data = await getData(currentDate);
    if (data[host]) {
        data[host] += seconds;
    } else {
        data[host] = seconds;
    }
    // save the updated value
    save(currentDate, data);
    chrome.storage.local.get(console.log)
}

const save = (key, value) => {
    return new Promise((resolve) => {
        STORAGE.set({ [key]: value }, () => {
            resolve();
        });
    });
}

const getData = (key) => {
    return new Promise((resolve) => {
        STORAGE.get(key, result => (result[key] ? resolve(result[key]) : resolve({})));
    });
}

// end the active tab
const end = () => {
    if (active.host) {
        // how much time passed since active started vs ended
        const diff = parseInt((Date.now() - active.time) / 1000);
        console.log(`used ${diff} seconds on ${active.host}`);
        update(active.host, diff);
        active = {};
    }
}

// get the current active tab
const getActiveTab = () => {
    return new Promise((resolve) =>
        // return list of tabs that are active and in current window
        // only 1 tab should meet this description
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }).then(
            // get the first and only tab within the query's returned tabs
            tabs => {
                resolve(tabs[0]);
            }
        )
    );
}

const setActiveTab = () => {
    getActiveTab().then(
        (activeTab) => {
            const url = activeTab.url;
            try {

                // get the current hostname of the active tab
                let host = new URL(url).hostname;
                host = host.replace('www.', '').replace('.com', '');
                console.log(host);

                // if the current tab uses one of the urls that is being tracked
                if (urls.some(url => url.includes(host))) {

                    end();
                    active = {
                        host: host,
                        time: Date.now()
                    };

                    /*
                    if (active.host !== host) {
                        end();

                        active = {
                            host: host,
                            time: Date.now()
                        };
                    }
                    */
                }

            } catch (error) {
                console.log(error);
            }


        }
    )
}

// when a new url is visited on a tab
chrome.tabs.onUpdated.addListener(() => {
    setActiveTab();
});

// display new active tab details upon switching tasbs
chrome.tabs.onActivated.addListener(() => {
    if (active.host) {
        end();
    }
    // check to see if the active tab is among the sites being tracked
    setActiveTab();
});

// note when chrome browser is no longer focused
// when chrome browser loses focus, window variable (aka the windowID) is -1
chrome.windows.onFocusChanged.addListener(window => {
    if (window === -1) {
        // browser lost focus
        end();
    } else {
        setActiveTab();
    }
});

// periodically update the screentime, regardless of whether tabs are switched
// otherwise, if someone just stays on youtube the whole time, then there would be no updates
// to screentime.
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.get('periodicUpdate', a => {
        if (!a) chrome.alarms.create('periodicUpdate', { periodInMinutes: 0.25 });
    });
});

chrome.alarms.onAlarm.addListener(() => {
    setActiveTab();
});
