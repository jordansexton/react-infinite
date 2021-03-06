jest.dontMock('../src/react-infinite.jsx');
jest.dontMock('../src/computers/infinite_computer.js');
jest.dontMock('../src/computers/constant_infinite_computer.js');
jest.dontMock('../src/computers/array_infinite_computer.js');
jest.dontMock('../src/utils/binary_index_search.js');
jest.dontMock('lodash.isfinite');
jest.dontMock('lodash.isarray');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Infinite = require('../src/react-infinite.jsx');

var renderHelpers = {
  divGenerator: function(number, height) {
    number = number || 10;
    height = height || 100;

    var divArray = [];
    for (var i = 0; i < number; i++) {
      divArray.push(<div className={"test-div-" + i} key={i} style={{height: height}}/>)
    }

    return divArray;
  },
  variableDivGenerator: function(heights) {
    var divArray = [];
    for (var i = 0; i < heights.length; i++) {
      divArray.push(<div className={"test-div-" + i} key={i} style={{height: heights[i]}}/>)
    }
    return divArray;
  }
}

describe('Rendering the React Infinite Component Wrapper', function() {
  it('throws an error when given only one child', function() {
    expect(function() {
      TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"root-scrollable-node"}>
          <div/>
        </Infinite>
      );
    }).toThrow();
  });

  it('renders itself into the DOM with the correct container styles', function() {
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"root-scrollable-node"}>
          <div/>
          <div/>
        </Infinite>
      );

    var rootScrollable = TestUtils.findRenderedDOMComponentWithClass(infinite, 'root-scrollable-node')
    expect(rootScrollable.props.style.height).toEqual(800);
    expect(rootScrollable.props.style.overflowX).toEqual('hidden');
    expect(rootScrollable.props.style.overflowY).toEqual('scroll');
  });

  it('applies the provided class name to the root node', function() {
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"correct-class-name"}>
          <div/>
          <div/>
        </Infinite>
      );

    expect(infinite.props.className).toEqual("correct-class-name");
  });
})

describe('The Children of the React Infinite Component', function() {
  it ("renders its children when no hiding behavior is required", function() {
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"correct-class-name"}>
          <div className={"test-div-0"}/>
          <div className={"test-div-1"}/>
        </Infinite>
      );

    expect(rootNode.refs.topSpacer.props.style.height).toEqual("0px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("0px");

    expect(TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-0')).not.toBeUndefined();
    expect(TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-1')).not.toBeUndefined();
  });

  it ("renders its children when some DOM nodes are hidden", function() {
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(10, elementHeight)}
        </Infinite>
      );

    expect(rootNode.refs.topSpacer.props.style.height).toEqual("0px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("800px");

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to the containerHeight, 800 pixels
    // preloadAdditionalHeight defaults to containerHeight / 2 pixels, 400 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    for (var i = 0; i < 6; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }

    for (var i = 6; i < 10; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }
  });

  it ("renders more children when preloadAdditionalHeight is increased beyond its default", function() {
    var elementHeight = 200;
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  preloadAdditionalHeight={1000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(10, elementHeight)}
        </Infinite>
      );

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to the containerHeight, 800 pixels
    // preloadAdditionalHeight defaults to containerHeight / 2 pixels, 400 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    for (var i = 0; i < 7; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).not.toThrow();
    }

    for (var i = 7; i < 10; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).toThrow();
    }
  });

  it ("renders more children when preloadBatchSize is increased beyond its default", function() {
    var elementHeight = 200;
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  preloadBatchSize={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(10, elementHeight)}
        </Infinite>
      );

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to the containerHeight, 800 pixels
    // preloadAdditionalHeight defaults to containerHeight / 2 pixels, 400 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    for (var i = 0; i < 8; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).not.toThrow();
    }

    for (var i = 8; i < 10; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).toThrow();
    }
  });
})

describe('The Scrolling Behavior of the Constant Height React Infinite Component', function() {
  it('hides visible elements when the user scrolls sufficiently', function() {
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 1500
      }
    });

    //  Schematic
    //  0 pixels: start of topSpacer element
    //  400 pixels: windowTop, start of first displayed element
    //  1200 pixels: blockStart, start of the block that scrollTop of 1500 pixels is in
    //    (the block size default is containerHeight / 2)
    //  1600 pixels: blockEnd, end of block that scrollTop of 1500 pixels is in
    //  2400 pixels: windowBottom, end of first displayed element
    //  4000 pixels: end of bottomSpacer element
    expect(rootNode.refs.topSpacer.props.style.height).toEqual("400px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("1600px");

    // Above the batch and its preloadAdditionalHeight
    for (var i = 0; i < 2; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 2; i < 12; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }

    // Below the batch and its preloadAdditionalHeight
    for (var i = 12; i < 20; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }
  });

  it("functions correctly at the end of its range", function() {
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    // The total scrollable height here is 4000 pixels
    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 3600
      }
    });

    expect(rootNode.refs.topSpacer.props.style.height).toEqual("2800px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("0px");

    // Above the batch and its preloadAdditionalHeight
    for (var i = 0; i < 14; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 14; i < 20; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }
  })
});

describe('The Behavior of the Variable Height React Infinite Component', function() {
  it('hides elements when the user has not yet scrolled', function() {
                      // 20  40  200  300  350 500  525 550 575 600 725  805 880 900 1050 1300 1400 (16)
    var elementHeight = [20, 20, 160, 100, 50, 150, 25, 25, 25, 25, 125, 80, 75, 20, 150, 250, 100];
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={420}
                  className={"correct-class-name"}>
          {renderHelpers.variableDivGenerator(elementHeight)}
        </Infinite>
      );

    //  Schematic
    //  0 pixels: start of topSpacer element, start of windowTop
    //  420 pixels: end of container
    //  630 pixels: end of windowBottom
    //  1400 pixels: end of bottomSpacer element
    expect(rootNode.refs.topSpacer.props.style.height).toEqual("0px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("675px");

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 1; i < 11; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }

    // Below the batch and its preloadAdditionalHeight
    for (var i = 11; i < 16; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }
  });

  it('hides visible elements when the user scrolls sufficiently', function() {
                      // 20  40  200  300  350 500  525 550 575 600 725  805 880 900 1050 1300 1400 (17)
    var elementHeight = [20, 20, 160, 100, 50, 150, 25, 25, 25, 25, 125, 80, 75, 20, 150, 250, 100];
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={400}
                  className={"correct-class-name"}>
          {renderHelpers.variableDivGenerator(elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 700
      }
    });

    //  Schematic
    //  0 pixels: start of topSpacer element
    //  200 pixels: windowTop, start of first displayed element
    //  600 pixels: blockStart, start of the block that the scrollTop of 700 pixels is in
    //  800 pixels: blockEnd, end of the block that the scrollTop of 700 pixels is in
    //  1200 pixels: windowBottom, end of displayed element
    //  1400 pixels: end of bottomSpacer element

    expect(rootNode.refs.topSpacer.props.style.height).toEqual("40px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("100px");

    // Above the batch and its preloadAdditionalHeight
    for (var i = 0; i < 2; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 2; i < 16; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }

    // Below the batch and its preloadAdditionalHeight
    for (var i = 16; i < 17; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }
  });

  it("functions correctly at the end of its range", function() {
                      // 20  40  200  300  350 500  525 550 575 600 725  805 880 900 1050 1300 1400 (16)
    var elementHeight = [20, 20, 160, 100, 50, 150, 25, 25, 25, 25, 125, 80, 75, 20, 150, 250, 100];
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={400}
                  className={"correct-class-name"}>
          {renderHelpers.variableDivGenerator(elementHeight)}
        </Infinite>
      );

    // The total scrollable height here is 4000 pixels
    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 1000
      }
    });

    //  Schematic
    //  0 pixels: start of topSpacer element
    //  600 pixels: start of windowTop
    //  1000 pixels: start of block
    //  1400 pixels: end of block
    //  1400 pixels: end of windowBottom
    expect(rootNode.refs.topSpacer.props.style.height).toEqual("575px");
    expect(rootNode.refs.bottomSpacer.props.style.height).toEqual("0px");

    // Above the batch and its preloadAdditionalHeight
    for (var i = 0; i < 9; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 9; i < 15; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }
  })
});

describe("React Infinite's Infinite Scroll Capabilities", function() {

  it("infiniteLoadBeginBottomOffset does not always trigger infinite load on scroll", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 300 // past the bottom offset
      }
    });

    expect(infiniteSpy).not.toHaveBeenCalled();
  });

  it("triggers the onInfiniteLoad function when scrolling past infiniteLoadBeginBottomOffset", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 3600 // past the bottom offset
      }
    });

    expect(infiniteSpy).toHaveBeenCalled();
  });

  it("does not always display the loadingSpinnerDelegate", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  loadingSpinnerDelegate={<div className={"delegate-div"} />}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 100 // past the bottom offset
      }
    });

    expect(function() {
      TestUtils.findRenderedDOMComponentWithClass(rootNode, 'delegate-div')
    }).toThrow();
  });

  it("displays the loadingSpinnerDelegate when isInfiniteLoading", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  loadingSpinnerDelegate={<div className={"delegate-div"} />}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 3600 // past the bottom offset
      }
    });

    expect(function() {
      TestUtils.findRenderedDOMComponentWithClass(rootNode, 'delegate-div')
    }).not.toThrow();
  });
});

describe("Maintaining React Infinite's internal scroll state", function() {
  it("has does not have pointer-events: none by default", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  timeScrollStateLastsForAfterUserScrolls={10000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );
  var wrapper = rootNode.refs.smoothScrollingWrapper;
  expect(wrapper.props.style.pointerEvents).toBeUndefined();
  });

  it("has pointer-events: none upon scroll", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  timeScrollStateLastsForAfterUserScrolls={10000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

  TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
    target: {
      scrollTop: 100 // past the bottom offset
    }
  });

  var wrapper = rootNode.refs.smoothScrollingWrapper;
  expect(wrapper.props.style.pointerEvents).toEqual('none');
  });
})

describe("Rerendering React Infinite", function() {
  it("updates the infinite computer", function() {
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={17}
                  containerHeight={450}
                  infiniteLoadBeginBottomOffset={1000}
                  loadingSpinnerDelegate={<div className={"delegate-div"} />}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, 17)}
        </Infinite>
      );

    expect(rootNode.state.infiniteComputer.heightData).toEqual(17);
    expect(rootNode.state.infiniteComputer.numberOfChildren).toEqual(20);

    rootNode.setProps({
      children: renderHelpers.divGenerator(74, 17)
    });
    expect(rootNode.state.infiniteComputer.numberOfChildren).toEqual(74);

    rootNode.setProps({
      elementHeight: [10, 20, 30]
    });
    expect(rootNode.state.infiniteComputer.heightData).toEqual([10, 20, 30]);

  });
})
