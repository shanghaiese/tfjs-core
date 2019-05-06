/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '../index';
import {ALL_ENVS, describeWithFlags} from '../jasmine_util';
import {expectArraysClose} from '../test_util';
import {Rank} from '../types';

function generateCaseInputs(totalSizeTensor: number, totalSizeFilter: number) {
  const inp = new Array(totalSizeTensor);
  const filt = new Array(totalSizeFilter);

  for (let i = 0; i < totalSizeTensor; i++) {
    inp[i] = i + 1;
  }
  for (let i = 0; i < totalSizeFilter; i++) {
    filt[i] = i + 1;
  }

  return {input: inp, filter: filt};
}

describeWithFlags('conv2d', ALL_ENVS, () => {
  it('x=[1,4,4,1] f=[1,1,1,3] s=2 d=1 p=same', async () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [4, 4, inputDepth];
    const outputDepth = 3;
    const fSize = 1;
    const pad = 'same';
    const stride: [number, number] = [2, 2];

    const x = tf.tensor3d(
        [
          10, 30, 50, 70, 20, 40, 60, 80, -10, -30, -50, -70, -20, -40, -60, -80
        ],
        inputShape);
    const w = tf.tensor4d([1, 0.5, 1], [fSize, fSize, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad);

    expectArraysClose(
        await result.data(),
        [10, 5, 10, 50, 25, 50, -10, -5, -10, -50, -25, -50]);
  });
  it('x=[2,2,1] f=[1,1,1,2] s=1 d=1 p=0', async () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 1;
    const pad = 0;
    const stride = 1;

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    const w = tf.tensor4d([2], [fSize, fSize, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad);

    expectArraysClose(await result.data(), [2, 4, 6, 8]);
  });

  it('x=[3,3,2] f=[2,2,2,1] s=1 d=1 p=valid', async () => {
    const pad = 'valid';
    const stride = 1;

    const x = tf.tensor3d(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90],
        [3, 3, 2]);
    const w = tf.tensor4d([1, 2, 3, 4, 5, 6, 7, 8], [2, 2, 2, 1]);

    const result = tf.conv2d(x, w, stride, pad);

    const resultData = await result.data();
    expect(result.shape).toEqual([2, 2, 1]);
    expectArraysClose(resultData, new Float32Array([256, 535, 1570, 2209]));
  });

  it('x=[2,2,2,1] f=[1,1,1,1] s=1 d=1 p=0', async () => {
    const inputDepth = 1;
    const inShape: [number, number, number, number] = [2, 2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 1;
    const pad = 0;
    const stride = 1;

    const x = tf.tensor4d([1, 2, 3, 4, 5, 6, 7, 8], inShape);
    const w = tf.tensor4d([2], [fSize, fSize, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad);
    expect(result.shape).toEqual([2, 2, 2, 1]);
    const expected = [2, 4, 6, 8, 10, 12, 14, 16];

    expectArraysClose(await result.data(), expected);
  });

  it('x=[2,4,1] f=[4,2,1,1] s=1 d=1 p=same', async () => {
    const inputDepth = 1;
    const outputDepth = 1;
    const pad = 'same';
    const stride = 1;
    const dataFormat = 'NHWC';
    const dilation = 1;

    const x = tf.tensor3d([1, 2, 3, 4, 5, 6, 7, 8], [2, 4, inputDepth]);
    const w =
        tf.tensor4d([3, 1, 5, 0, 2, 7, 8, 9], [4, 2, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad, dataFormat, dilation);

    const resultData = await result.data();
    expect(result.shape).toEqual([2, 4, 1]);
    expectArraysClose(
        resultData, new Float32Array([57, 71, 85, 36, 30, 39, 48, 52]));
  });

  it('x=[2,2,1] f=[2,2,1,1] s=1 d=1 p=same', async () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const pad = 'same';
    const stride = 1;
    const dataFormat = 'NHWC';
    const dilation = 1;

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    const w =
        tf.tensor4d([3, 1, 5, 0], [fSize, fSize, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad, dataFormat, dilation);

    const resultData = await result.data();
    expect(result.shape).toEqual([2, 2, 1]);
    expectArraysClose(resultData, new Float32Array([20, 26, 13, 12]));
  });

  it('x=[2,2,1] f=[2,2,1,1] s=1 d=1 p=0', async () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const pad = 0;
    const stride = 1;
    const dataFormat = 'NHWC';
    const dilation = 1;

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    const w =
        tf.tensor4d([3, 1, 5, 0], [fSize, fSize, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad, dataFormat, dilation);
    expectArraysClose(await result.data(), [20]);
  });

  it('x=[4,4,1] f=[2,2,1,1] s=1 d=2 p=0', async () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [4, 4, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const fSizeDilated = 3;
    const pad = 0;
    const stride = 1;
    const dataFormat = 'NHWC';
    const dilation = 2;
    const noDilation = 1;

    const x = tf.tensor3d(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], inputShape);
    const w =
        tf.tensor4d([3, 1, 5, 2], [fSize, fSize, inputDepth, outputDepth]);
    // adding a dilation rate is equivalent to using a filter
    // with 0s for the dilation rate
    const wDilated = tf.tensor4d(
        [3, 0, 1, 0, 0, 0, 5, 0, 2],
        [fSizeDilated, fSizeDilated, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad, dataFormat, dilation);
    const expectedResult =
        tf.conv2d(x, wDilated, stride, pad, dataFormat, noDilation);

    expect(result.shape).toEqual(expectedResult.shape);
    expectArraysClose(await result.data(), await expectedResult.data());
    expect(result.shape).toEqual(expectedResult.shape);
    expect(result.dtype).toBe(expectedResult.dtype);
  });

  it('x=[1,3,6,1] f=[2,2,1,1] s=[1,2] d=1 p=valid', async () => {
    const inputDepth = 1;
    const inputShape: [number, number, number, number] = [1, 3, 6, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const pad = 'valid';
    const stride: [number, number] = [1, 2];

    const inputs = generateCaseInputs(1 * 3 * 6 * inputDepth, fSize * fSize);
    const x = tf.tensor4d(inputs.input, inputShape);
    const w =
        tf.tensor4d(inputs.filter, [fSize, fSize, inputDepth, outputDepth]);

    const result = tf.conv2d(x, w, stride, pad);
    expectArraysClose(
        await result.data(), [58.0, 78.0, 98.0, 118.0, 138.0, 158.0]);
  });

  it('throws when x is not rank 3', () => {
    const inputDepth = 1;
    const outputDepth = 1;
    const fSize = 2;
    const pad = 0;
    const stride = 1;

    // tslint:disable-next-line:no-any
    const x: any = tf.tensor2d([1, 2, 3, 4], [2, 2]);
    const w =
        tf.tensor4d([3, 1, 5, 0], [fSize, fSize, inputDepth, outputDepth]);

    expect(() => tf.conv2d(x, w, stride, pad)).toThrowError();
  });

  it('throws when weights is not rank 4', () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const pad = 0;
    const stride = 1;

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    // tslint:disable-next-line:no-any
    const w: any = tf.tensor3d([3, 1, 5, 0], [2, 2, 1]);

    expect(() => tf.conv2d(x, w, stride, pad)).toThrowError();
  });

  it('throws when x depth does not match weight depth', () => {
    const inputDepth = 1;
    const wrongInputDepth = 5;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const pad = 0;
    const stride = 1;

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    const w =
        tf.randomNormal<Rank.R4>([fSize, fSize, wrongInputDepth, outputDepth]);

    expect(() => tf.conv2d(x, w, stride, pad)).toThrowError();
  });

  it('throws when dimRoundingMode is set and pad is not a number', () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const pad = 'valid';
    const stride = 1;
    const dataFormat = 'NHWC';
    const dilation = 1;
    const dimRoundingMode = 'round';

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    const w = tf.randomNormal<Rank.R4>([fSize, fSize, inputDepth, outputDepth]);

    expect(
        () =>
            tf.conv2d(x, w, stride, pad, dataFormat, dilation, dimRoundingMode))
        .toThrowError();
  });

  it('throws when both stride and dilation are greater than 1', () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const outputDepth = 1;
    const fSize = 2;
    const pad = 0;
    const stride: [number, number] = [2, 1];
    const dataFormat = 'NHWC';
    const dilation: [number, number] = [1, 2];

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);
    const w =
        tf.tensor4d([3, 1, 5, 0], [fSize, fSize, inputDepth, outputDepth]);

    expect(() => tf.conv2d(x, w, stride, pad, dataFormat, dilation))
        .toThrowError();
  });

  it('gradient with clones input=[3,3,1] f=[2,2,1,1] s=1 p=0', async () => {
    const inputDepth = 1;
    const outputDepth = 1;
    const inputShape: [number, number, number] = [3, 3, inputDepth];
    const filterSize = 2;
    const stride = 1;
    const pad = 0;

    const filterShape: [number, number, number, number] =
        [filterSize, filterSize, inputDepth, outputDepth];
    const filter = tf.ones<Rank.R4>(filterShape);

    const x = tf.tensor3d([1, 2, 3, 4, 5, 6, 7, 8, 9], inputShape);
    const dy = tf.tensor3d([3, 1, 2, 0], [2, 2, 1]);

    const grads = tf.grads(
        (x: tf.Tensor3D, filter: tf.Tensor4D) =>
            x.clone().conv2d(filter.clone(), stride, pad).clone());
    const [dx, dfilter] = grads([x, filter], dy);

    expect(dx.shape).toEqual(x.shape);
    expectArraysClose(await dx.data(), [3, 4, 1, 5, 6, 1, 2, 2, 0]);

    expect(dfilter.shape).toEqual(filterShape);
    expectArraysClose(await dfilter.data(), [13, 19, 31, 37]);
  });

  it('gradient x=[2,3,3,1] f=[2,2,1,1] s=1 p=0', async () => {
    const inputDepth = 1;
    const outputDepth = 1;
    const inputShape: [number, number, number, number] = [2, 3, 3, inputDepth];
    const filterSize = 2;
    const stride = 1;
    const pad = 0;

    const filterShape: [number, number, number, number] =
        [filterSize, filterSize, inputDepth, outputDepth];
    const filter = tf.ones<Rank.R4>(filterShape);

    const x = tf.tensor4d(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9], inputShape);
    const dy = tf.tensor4d([3, 1, 2, 0, 3, 1, 2, 0], [2, 2, 2, 1]);

    const grads = tf.grads(
        (x: tf.Tensor4D, filter: tf.Tensor4D) => x.conv2d(filter, stride, pad));
    const [dx, dfilter] = grads([x, filter], dy);

    expect(dx.shape).toEqual(x.shape);
    expectArraysClose(
        await dx.data(),
        [3, 4, 1, 5, 6, 1, 2, 2, 0, 3, 4, 1, 5, 6, 1, 2, 2, 0]);

    expect(dfilter.shape).toEqual(filterShape);
    expectArraysClose(await dfilter.data(), [13 * 2, 19 * 2, 31 * 2, 37 * 2]);
  });

  it('throws when passed x as a non-tensor', () => {
    const inputDepth = 1;
    const outputDepth = 1;
    const fSize = 1;
    const pad = 0;
    const stride = 1;

    const w = tf.tensor4d([2], [fSize, fSize, inputDepth, outputDepth]);

    expect(() => tf.conv2d({} as tf.Tensor3D, w, stride, pad))
        .toThrowError(/Argument 'x' passed to 'conv2d' must be a Tensor/);
  });

  it('throws when passed filter as a non-tensor', () => {
    const inputDepth = 1;
    const inputShape: [number, number, number] = [2, 2, inputDepth];
    const pad = 0;
    const stride = 1;

    const x = tf.tensor3d([1, 2, 3, 4], inputShape);

    expect(() => tf.conv2d(x, {} as tf.Tensor4D, stride, pad))
        .toThrowError(/Argument 'filter' passed to 'conv2d' must be a Tensor/);
  });

  it('accepts a tensor-like object', async () => {
    const pad = 0;
    const stride = 1;
    const x = [[[1], [2]], [[3], [4]]];  // 2x2x1
    const w = [[[[2]]]];                 // 1x1x1x1

    const result = tf.conv2d(x, w, stride, pad);
    expectArraysClose(await result.data(), [2, 4, 6, 8]);
  });
});
