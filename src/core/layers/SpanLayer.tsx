import * as React from 'react';
import * as d3Scale from 'd3-scale';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import PollingResizingCanvasLayer from './PollingResizingCanvasLayer';
import { getIndexBoundsForSpanData } from '../renderUtils';
import propTypes from '../propTypes';
import { Interval, Color, SpanDatum } from '../interfaces';

export interface Props {
  data: SpanDatum[];
  xDomain: Interval;
  fillColor?: Color;
  borderColor?: Color;
}

@NonReactRender
@PixelRatioContext
export default class SpanLayer extends React.PureComponent<Props, void> {
  context: Context;

  static propTypes: React.ValidationMap<Props> = {
    data: React.PropTypes.arrayOf(propTypes.spanDatum).isRequired,
    xDomain: propTypes.interval.isRequired,
    fillColor: React.PropTypes.string,
    borderColor: React.PropTypes.string
  };

  static defaultProps: Partial<Props> = {
    fillColor: 'rgba(0, 0, 0, 0.1)'
  };

  render() {
    return <PollingResizingCanvasLayer
      ref='canvasLayer'
      onSizeChange={this.nonReactRender}
      pixelRatio={this.context.pixelRatio}
    />;
  }

  nonReactRender = () => {
    const { width, height, context } = (this.refs['canvasLayer'] as PollingResizingCanvasLayer).resetCanvas();
    _renderCanvas(this.props, width, height, context);
  }
}

// Export for testing.
export function _renderCanvas(props: Props, width: number, height: number, context: CanvasRenderingContext2D) {
  const { firstIndex, lastIndex } = getIndexBoundsForSpanData(props.data, props.xDomain, 'minXValue', 'maxXValue');
  if (firstIndex === lastIndex) {
    return;
  }

  const xScale = d3Scale.scaleLinear()
    .domain([ props.xDomain.min, props.xDomain.max ])
    .rangeRound([ 0, width ]);

  context.lineWidth = 1;
  context.strokeStyle = props.borderColor!;

  for (let i = firstIndex; i < lastIndex; ++i) {
    const left = xScale(props.data[i].minXValue);
    const right = xScale(props.data[i].maxXValue);
    const width = right - left;
    context.beginPath();
    context.rect(left, -1, width <= 0 ? 1 : width, height + 2);

    if (props.fillColor) {
      context.fillStyle = props.fillColor;
      context.fill();
    }

    if (props.borderColor) {
      context.stroke();
    }
  }
}
