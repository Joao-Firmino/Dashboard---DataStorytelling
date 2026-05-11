import createGraph from "./createGraph.js";
import filterData from "../../../Tools/FiltersFunctions/filterData.js";
import histogram from "../../Histogram/histogram.js";
import getGeneralHistogramActivityData from "../../../Tools/GetsFunctions/getGeneralHistogramActivityData.js";
import loadDashboardData from "../../../Tools/GetsFunctions/loadDashboardData.js";

async function generateGraph(activity) {
    const DATASTORE = await loadDashboardData();
    let dataToBePlotted = filterData(DATASTORE, activity)
    dataToBePlotted["totalStudents"] = (DATASTORE.users).length
    createGraph(dataToBePlotted, activity)


    
    let generalHistogramActivityData = getGeneralHistogramActivityData(DATASTORE, activity);
    histogram(generalHistogramActivityData, activity)



}

export default generateGraph