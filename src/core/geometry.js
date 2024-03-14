/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const { Point } = require("./graphics");

/**
 * @private
 * Test whether the two points are horizontal
 * @param {Point} p1
 * @param {Point} p2
 */
function isHorz(p1, p2) {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return dx > dy;
}

/**
 * @private
 * Squared distance between two points
 * @param {Point} p1
 * @param {Point} p2
 */
function distance2(p1, p2) {
  // eslint-disable-next-line prefer-exponentiation-operator, no-restricted-properties
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

/**
 * @private
 * Shortest distance from a point to line (start point to end point)
 * @param {Point} point
 * @param {Point} startPoint
 * @param {Point} endPoint
 */
function distanceToLine(point, startPoint, endPoint) {
  const l2 = distance2(startPoint, endPoint);
  if (l2 === 0) return distance2(point, startPoint);
  let t =
    ((point.x - startPoint.x) * (endPoint.x - startPoint.x) +
      (point.y - startPoint.y) * (endPoint.y - startPoint.y)) /
    l2;
  t = Math.max(0, Math.min(1, t));
  const squared = distance2(
    point,
    new Point(
      startPoint.x + t * (endPoint.x - startPoint.x),
      startPoint.y + t * (endPoint.y - startPoint.y),
    ),
  );
  return Math.sqrt(squared);
}

exports.isHorz = isHorz;
exports.distanceToLine = distanceToLine;
