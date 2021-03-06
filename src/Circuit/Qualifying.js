/* @flow */
import React from 'react'

import {
  View,
  StyleSheet,
  ListView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'

import ScalableText from 'react-native-text'

import StatsHeader from './StatsHeader'
import api from '../Utils/api'
import ErrorPage from '../Components/ErrorPage'

const ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2
})

export default class QualifyingScreen extends React.Component {
  static propTypes = {
    navigation: React.PropTypes.object.isRequired,
    info: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      error: false,
      qualifyingResults: [],
      refreshing: false
    }
  }

  _getQualifyingResults() {
    const detail = this.props.info

    api.getQualifyingResults({season: detail.season, round: detail.round})
      .then((res) => {
        this.setState({
          isLoading: false,
          refreshing: false,
          error: false,
          qualifyingResults: ds.cloneWithRows(res.MRData.RaceTable.Races[0].QualifyingResults)
        })
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          refreshing: false,
          error: true,
        })
      })
  }

  componentWillMount() {
    this._getQualifyingResults()
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <StatsHeader name={this.props.navigation.state.routeName} />
          <ActivityIndicator
            animating={this.state.isLoading}
            style={[styles.centering, {height: 80}]}
            size="large" />
        </View>
      )
    } else if (!this.state.isLoading && this.state.qualifyingResults.length === 0 && this.state.error) {
      return (
        <ErrorPage />
      )
    } else {
      return (
        <View style={styles.container}>
          <StatsHeader name={this.props.navigation.state.routeName} />
          <ListView
            style={styles.results}
            refreshControl={this._refreshControl()}
            dataSource={this.state.qualifyingResults}
            renderRow={this.renderRow.bind(this)} />
        </View>
      )
    }
  }

  _refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.refreshing}
        onRefresh={()=>this._refreshListView()} />
    )
  }

  _refreshListView() {
    this.setState({refreshing: true})
    this._getQualifyingResults()
  }

  renderRow(rowData) {
    let q2
    let q3

    if (rowData.Q2) {
      q2 = rowData.Q2
    } else {
      q2 = '- -'
    }

    if (rowData.Q3) {
      q3 = rowData.Q3
    } else {
      q3 = '- -'
    }

    return (
      <View style={styles.driver}>
        <ScalableText style={styles.position}>{rowData.position}</ScalableText>
        <View style={styles.info}>
          <ScalableText style={styles.name}><ScalableText style={styles.number}>{rowData.Driver.permanentNumber}</ScalableText> {rowData.Driver.givenName} {rowData.Driver.familyName}</ScalableText>
          <ScalableText style={styles.teamConstructor}>{rowData.Constructor.name}</ScalableText>
        </View>
        <View style={styles.status}>
          <View style={styles.statusBox}>
            <ScalableText style={styles.statusTxt}>Q1:</ScalableText>
            <ScalableText style={styles.statusTime}>{rowData.Q1}</ScalableText>
          </View>
          <View style={styles.statusBox}>
            <ScalableText style={styles.statusTxt}>Q2:</ScalableText>
            <ScalableText style={[styles.statusTime, q2 === '- -' ? styles.textCenter : '']}>{q2}</ScalableText>
          </View>
          <View style={styles.statusBox}>
            <ScalableText style={styles.statusTxt}>Q3:</ScalableText>
            <ScalableText style={[styles.statusTime, q3 === '- -' ? styles.textCenter : '']}>{q3}</ScalableText>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  driver: {
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6'
  },
  position: {
    fontFamily: 'Raleway-Medium',
    fontSize: 16,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#f94057',
    lineHeight: Platform.OS === 'ios' ? 50 : 36,
    marginRight: 10,
    width: 20,
    height: 50,
  },
  info: {
    flex: 1,
    paddingTop: 10,
  },
  number: {
    color: '#f94057'
  },
  name: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: '#444'
  },
  teamConstructor: {
    fontFamily: 'Raleway-Medium',
    fontSize: 12,
    lineHeight: 12,
    color: '#819cad',
    paddingTop: 5
  },
  status: {
    width: 95,
  },
  statusBox: {
    flexDirection: 'row',
  },
  statusTxt: {
    width: 27,
    fontFamily: 'Raleway-Medium',
    color: '#f94057',
  },
  statusTime: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Raleway-SemiBold',
    color: '#444',
  },
  textCenter: {
    textAlign: 'center',
  }
})
