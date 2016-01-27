import React from 'react';
import PureRender from 'pure-render-decorator';
import d3Scale from 'd3-scale';
import _ from 'lodash';

import { decorator as CanvasRender } from '../mixins/CanvasRender';
import { decorator as PixelRatioContext } from '../mixins/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import { getBoundsForTimeSpanData } from '../util';

import propTypes from '../propTypes';

@PureRender
@CanvasRender
@PixelRatioContext
class TimeSpanLayer extends React.Component {
  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.shape({
      timeSpan: propTypes.range.isRequired,
      color: React.PropTypes.string
    })).isRequired,
    xDomain: propTypes.range.isRequired,
    color: React.PropTypes.string
  };

  static defaultProps = {
    color: 'rgba(0, 0, 0, 0.1)'
  };

  render() {
    return <AutoresizingCanvasLayer ref='canvasLayer' onSizeChange={this.canvasRender}/>;
  }

  canvasRender = () => {
    const canvas = this.refs.canvasLayer.getCanvasElement();
    const { width, height } = this.refs.canvasLayer.getDimensions();
    const context = canvas.getContext('2d');
    context.resetTransform();
    context.scale(this.context.pixelRatio, this.context.pixelRatio);
    context.clearRect(0, 0, width, height);

    const { firstIndex, lastIndex } = getBoundsForTimeSpanData(this.props.data, this.props.xDomain);
    if (firstIndex === lastIndex) {
      return;
    }

    const xScale = d3Scale.linear()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    for (let i = firstIndex; i <= lastIndex; ++i) {
      const left = xScale(this.props.data[i].timeSpan.min);
      const right = xScale(this.props.data[i].timeSpan.max);
      context.beginPath();
      context.rect(left, 0, right - left, height);
      context.fillStyle = this.props.data[i].color || this.props.color;
      context.fill();
    }
  };
}

export default TimeSpanLayer;
