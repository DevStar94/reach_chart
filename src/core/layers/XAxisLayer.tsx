import * as React from 'react';
import * as PureRender from 'pure-render-decorator';
import * as d3Scale from 'd3-scale';
import * as _ from 'lodash';

import NonReactRender from '../decorators/NonReactRender';
import PixelRatioContext, { Context } from '../decorators/PixelRatioContext';

import AutoresizingCanvasLayer from './AutoresizingCanvasLayer';
import propTypes from '../propTypes';
import { computeTicks } from '../renderUtils';
import { Range, ScaleFunction, Ticks, TickFormat, Color } from '../interfaces';

const DEFAULT_TICK_COUNT = 5;
// TODO: Do any of these need to be configurable?
const VERTICAL_PADDING = 4;
const HORIZONTAL_PADDING = 6;

export interface Props {
  xDomain: Range;
  scale?: ScaleFunction;
  ticks?: Ticks;
  tickFormat?: TickFormat;
  color?: Color;
  font?: string;
}

@PureRender
@NonReactRender
@PixelRatioContext
export default class XAxisLayer extends React.Component<Props, void> {
  context: Context;

  static propTypes = {
    xDomain: propTypes.range.isRequired,
    scale: React.PropTypes.func,
    ticks: propTypes.ticks,
    tickFormat: propTypes.tickFormat,
    color: React.PropTypes.string,
    font: React.PropTypes.string
  };

  static defaultProps = {
    scale: d3Scale.scaleTime,
    color: '#444',
    font: '12px sans-serif'
  };

  render() {
    return <AutoresizingCanvasLayer
      className='x-axis'
      ref='canvasLayer'
      onSizeChange={this.nonReactRender}
    />;
  }

  nonReactRender = () => {
    const { width, height, context } = AutoresizingCanvasLayer.resetCanvas(
      this.refs['canvasLayer'] as AutoresizingCanvasLayer,
      this.context.pixelRatio
    );

    const xScale = this.props.scale()
      .domain([ this.props.xDomain.min, this.props.xDomain.max ])
      .rangeRound([ 0, width ]);

    const { ticks, format } = computeTicks(xScale, this.props.xDomain, this.props.ticks, this.props.tickFormat);

    context.beginPath();

    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = this.props.color;
    context.font = this.props.font;

    for (let i = 0; i < ticks.length; ++i) {
      const xOffset = xScale(ticks[i]);

      context.fillText(format(ticks[i]).toUpperCase(),  xOffset + HORIZONTAL_PADDING, VERTICAL_PADDING);

      context.moveTo(xOffset, 0);
      context.lineTo(xOffset, height)
    }

    context.strokeStyle = this.props.color;
    context.stroke();
  };
}
