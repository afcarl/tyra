import { addIndex, assoc, concat, map, mergeAll, nth, prop, toPairs, values, zip, pick, filter, flatten } from 'ramda'
import * as R from "ramda"
import React from 'react'
import ReactHighcharts from 'react-highcharts'

export default React.createClass({
  getInitialState: function() {
    let self = this
    return {
      loading: false,
      config: {
        title: {
          text: 'Top Models',
          style: { "color": "#000000", "fontSize": "30px", "fontFamily": "Open Sans", "fontWeight": "300" }
        },
        chart: {
          height: 600
        },
        plotOptions: {
          series: {
            cursor: 'pointer',
            marker: { enabled: true },
            states: {
              hover: {
                enabled: true,
                lineWidthPlus: 5
              }
            },
            point: {
              events: {
                click: function() {
                  let d = new Date(this.options.x)
                  console.log(this.options)
                  self.handleModelClick(this.series.name , d.toISOString().split('T')[0])
                }
              }
            }
          }
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: true,
          margin: 10,
          layout: "horizontal",
          itemMarginTop: 5,
          itemHoverStyle: { "color": "#FFB2CD" },
          itemStyle: { "fontSize": "15px", "fontFamily": "Open Sans", "fontWeight": "300" }
        },
        xAxis: {
          labels: {
            style: { "fontSize": "15px", "fontFamily": "Open Sans", "fontWeight": "300" }
          },
          type: 'datetime',
          gridLineWidth: 0,
        },
        yAxis: {
          lineWidth:1,
          gridLineWidth: 0,
          tickWidth: 1,
          tickPosition: 'outside',
          title: {
            text: 'Precision @ Top 5%',
            style: { "fontSize": "15px", "fontFamily": "Open Sans", "fontWeight": "300" },
          },
        },
        series: []
      }
    }
  },
  componentDidMount: function() {
    this.ajax_call()
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    const self = this
    if (this.state !== nextState ||
        self.props.searchId !== nextProps.searchId ||
        self.props.numOfModelGroupsToShow !== nextProps.numOfModelGroupsToShow ||
        self.props.labelOfModelGroups !== nextProps.labelOfModelGroups) {
      return true
    }
    return false
  },
  componentDidUpdate: function(prevProps) {
    const self = this
    if(prevProps.searchId !== self.props.searchId) {
      this.ajax_call()
    }
    if(prevProps.numOfModelGroupsToShow !== self.props.numOfModelGroupsToShow) {
      this.ajax_call()
    }
    if(prevProps.labelOfModelGroups !== self.props.labelOfModelGroups) {
      this.ajax_call()
    }
  },
  componentWillUnmount: function() {
  },
  handleModelClick: function(modelId, asOfDate) {
    const self = this
    self.props.setModelId(modelId.split(" ")[1])
    self.props.setAsOfDate(asOfDate)
  },
  ajax_call: function() {
    let self = this
    self.setState({ loading: true })
    const metricParams = addIndex(map)(
      function(value, idx) {
        let newObj = {}
        newObj['metric' + idx] = value.metric
        newObj['parameter' + idx] = value.parameter
        return newObj
      },
      values(self.props.metrics)
    )
    const params = mergeAll(concat([{ timestamp: self.props.startDate.format('YYYY-MM-DD') }], metricParams))
    $.ajax({
      type: "POST",
      url: "/evaluations/search_model_groups/" + self.props.labelOfModelGroups,
      data: $.param(params),
      success: function(result) {
<<<<<<< HEAD
        const filteredModels = result.results
        const modelsToBeShow = filteredModels.slice(0, self.props.numOfModelGroupsToShow)
        let str2Date = (x) => { return [Date.parse(nth(0, x)), nth(1, x), nth(2, x)] }
        let model_schema = (x) => { return values(pick(['evaluation_start_time', 'value', 'model_id'], x))}
        let make_timeseries = (x) => { return map(str2Date, map(model_schema, x.series))}
=======
        const minDataPoints = 5
        function filterByNumOfData(item) {
          if (Object.keys(values(item)[2]).length >= minDataPoints) {
            return true
          }
          return false
        }
        const filteredModels = result.results.filter(filterByNumOfData)
        const modelsToBeShow = filteredModels.slice(0, self.props.numOfModelToShow)
        let str2Date = (x) => { return [Date.parse(nth(0, x)), nth(1, x)] }
        let make_timeseries = (x) => { return map(str2Date, toPairs(nth(2, values(x)))) }
>>>>>>> master
        const series_data = map(make_timeseries, modelsToBeShow)
        console.log(series_data)
        const yAxis_title = params['metric0'] + ' @ ' + params['parameter0']
        let getGroupId = (x) => { return prop('model_group_id', x) }
        let get_seriesname = (x) => { return map(getGroupId, x) }
        const series_name = get_seriesname(modelsToBeShow)
        console.log(series_name)
        let getId = (x) => { return prop('model_id', x) }
        let get_points = (x) => { return map(getId, x.series)}
        const series_model_id = map(get_points, modelsToBeShow)
        console.log(series_model_id)
        const lists = [series_data, series_name, series_model_id]
        let make_seriesconfig = (x) => { return assoc('data', nth(0, x),
                                                  assoc('name', 'model group ' + nth(1, x),
                                                        { 'type': 'line',
                                                          'index': nth(2, x),
                                                          'asOfDate':self.props.asOfDate }))
                                        }
        let newConfig = self.state.config
        newConfig.yAxis.title.text = yAxis_title
        newConfig.series = map(make_seriesconfig, zip(series_data, series_name))
        console.log(newConfig.series)
        self.setState({
          config: newConfig,
          loading: false
        })
      }
    })
  },
  render: function() {
    if(this.state.loading) {
      return (
        <div id="loader" style={{ margin: "0 auto" }} className="loader"></div>
      )
    } else {
      return (
        <div>
          <ReactHighcharts config={this.state.config} />
        </div>
      )
    }
  }
})
