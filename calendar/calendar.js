;(function(global, $, d3) {
  'use strict';
  
  /**
   * CalendarGlobals is used to store some global data
   * that will be shared between different functions.
   */
  var CalendarGlobals = (function() {
    var calendarWidth             = 1380,
        calendarHeight            = 820,
        gridXTranslation          = 10,
        gridYTranslation          = 40,
        cellColorForCurrentMonth  = '#EAEAEA',
        cellColorForPreviousMonth = '#FFFFFF',

        // Counter is used to keep track of the number of "back" and "forward" button
        // presses and to calculate the month to display.
        counter       = 0,
        currentMonth  = new Date().getMonth(),
        monthNames    = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datesGroup;

    function publicCalendarWidth() {
      return calendarWidth;
    }
    function publicCalendarHeight() {
      return calendarHeight;
    }
    function publicGridXTranslation() {
      return gridXTranslation;
    }
    function publicGridYTranslation() {
      return gridYTranslation;
    }
    function publicGridWidth() {
      return calendarWidth - 10;
    }
    function publicGridHeight() {
      return calendarHeight - 40;
    }
    function publicCellWidth() {
      return publicGridWidth() / 7;
    }
    function publicCellHeight() {
      return publicGridHeight() / 5;
    }
    function publicGetDatesGroup() {
      return datesGroup;
    }

    function publicSetDatesGroup(value) {
      datesGroup = value;
    }
    function publicIncrementCounter() {
      counter = counter + 1;
    }
    function publicDecrementCounter() {
      counter = counter - 1;
    }

    function publicMonthToDisplay() {
      var dateToDisplay = new Date();
      // We use the counter to keep track of `back` and `forward`
      // presses to get the current month to display.
      dateToDisplay.setMonth(currentMonth + counter);
      return dateToDisplay.getMonth();
    }
    function publicMonthToDisplayAsText() {
      return monthNames[publicMonthToDisplay()];
    }

    function publicYearToDisplay() {
      var dateToDisplay = new Date();
      dateToDisplay.setMonth(currentMonth + counter);
      return dateToDisplay.getFullYear();
    }

    function publicGridCellPositions() {
      // We store the top left positions of a 7 by 5 grid.
      // These positions will be our reference points for drawing
      // various objects such as the rectangular grids, the text indicating the date etc.
      var cellPositions = [];
      for (var y = 0; y < 5; y+=1) {
        for (var x = 0; x < 7; x+=1) {
          cellPositions.push([x * publicCellWidth(), y * publicCellHeight()]);
        }
      }

      return cellPositions;
    }

    /**
     * @public
     * @kind function
     * @name publicDaysInMonth
     * @description
     * This function generates all the days of the month. Since we will
     * be displaying a 7 by 5 grid, we will also need to get some of the days from
     * the previous month and the next month. This way our 7 by 5 grid will have all
     * the cells filled. The days from the previous or the next month will have a
     * different color to distinguish current month days.
     */
    function publicDaysInMonth() {
      var daysArray = [], i;

      var firstDayOfTheWeek = new Date(publicYearToDisplay(), publicMonthToDisplay(), 1).getDay();
      var daysInPreviousMonth = new Date(publicYearToDisplay(), publicMonthToDisplay(), 0).getDate();

      // Lets say the first week of the current month is a Wednesday. Then we need to get 3 days from
      // the end of the previous month. But we can't naively go from 29 - 31. We have to do it properly
      // depending on whether the last month was one that had 31 days, 30 days or 28.
      // figuring out the previous number of days
      for (i = 1; i <= firstDayOfTheWeek; i+=1) {
        daysArray.push([daysInPreviousMonth - firstDayOfTheWeek + i, cellColorForCurrentMonth]);
      }
      
      // Here are all the days in the current month
      var daysInMonth = new Date(publicYearToDisplay(), publicMonthToDisplay() + 1, 0).getDay();
      for (i = 1; i <= daysInMonth; i+=1) {
        daysArray.push([i, cellColorForCurrentMonth])
      }

      // Now figure out the number of days we need to fill in from next month
      // based on current totalDays from previous month + current month days.
      // Depending on how many days we have so far (from previous month and current), we will need
      // to get some days from next month. We can do this naively though, since all months start on
      // the 1st.
      var daysRequiredForNextMonth = 35 - daysArray.length;
      for (i = 1; i <= daysRequiredForNextMonth; i+=1) {
        daysArray.push([i, cellColorForPreviousMonth])
      }

      return daysArray.slice(0, 35);
    }

    // Revealing module pattern expose public API
    return ({
      calendarWidth       : publicCalendarWidth(),
      calendarHeight      : publicCalendarHeight(),
      gridXTranslation    : publicGridXTranslation(),
      gridYTranslation    : publicGridYTranslation(),
      gridWidth           : publicGridWidth(),
      gridHeight          : publicGridHeight(),
      cellWidth           : publicCellWidth(),
      cellHeight          : publicCellHeight(),
      getDatesGroup       : publicGetDatesGroup,
      setDatesGroup       : publicSetDatesGroup,
      incrementCounter    : publicIncrementCounter,
      decrementCounter    : publicDecrementCounter,
      monthToDisplay      : publicMonthToDisplay(),
      monthToDisplayAsText: publicMonthToDisplayAsText,
      yearToDisplay       : publicYearToDisplay,
      gridCellPositions   : publicGridCellPositions(),
      daysInMonth         : publicDaysInMonth
    });
  })();


  /**
   * @public
   * @kind function
   * @name renderCalendarGrid
   * @description
   * This is the initializing function.
   * It adds an svg element, draws a set of rectangles to form the calendar grid,
   * puts text in each cell representing the date and does the initial rendering of the pie charts.
   */
  function renderCalendarGrid() {

    // add calendar svg element
    CalendarGlobals.calendar = d3.select('#chart')
      .append('svg')
      .attr('class', 'calendar')
      .attr('width', CalendarGlobals.calendarWidth)
      .attr('height', CalendarGlobals.calendarHeight)
      .append('g');

    // Cell positions
    var cellPositions = CalendarGlobals.gridCellPositions;

    // Draw rectangles at the appropriate position, starting from the top left corner. Since we want to leave some room for the heading and buttons,
    // use the gridXTranslation and gridYTranslation variables.
    CalendarGlobals.calendar.selectAll("rect")
      .data(cellPositions)
      .enter()
      .append("rect")
      .attr("x", function (d) { return d[0]; })
      .attr("y", function (d) { return d[1]; })
      .attr("width", CalendarGlobals.cellWidth)
      .attr("height", CalendarGlobals.cellHeight)
      .style("stroke", "#555")
      .style("fill", "white")
      .attr("transform", "translate(" + CalendarGlobals.gridXTranslation + "," + CalendarGlobals.gridYTranslation + ")");


    var daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // This adds the day of the week headings on top of the grid
    CalendarGlobals.calendar.selectAll("headers")
      .data([0, 1, 2, 3, 4, 5, 6])
      .enter().append("text")
      .attr("x", function (d) { return cellPositions[d][0]; })
      .attr("y", function (d) { return cellPositions[d][1]; })
      .attr("dx", CalendarGlobals.gridXTranslation + 5) // right padding
      .attr("dy", 30) // vertical alignment : middle
      .text(function (d) { return daysOfTheWeek[d] });

    // The initial rendering of the dates for the current mont inside each of the cells in the grid. We create a named group ("datesGroup"),
    // and add our dates to this group. This group is also stored globally. Later on, when the the user presses the back and forward buttons
    // to navigate between the months, we clear and re add the new text elements to this group
    CalendarGlobals.datesGroup = CalendarGlobals.calendar.append("svg:g");
    var daysInMonthToDisplay = CalendarGlobals.daysInMonth();
    CalendarGlobals.datesGroup
      .selectAll("daysText")
      .data(daysInMonthToDisplay)
      .enter()
      .append("text")
      .attr("x", function (d, i) { return cellPositions[i][0]; })
      .attr("y", function (d, i) { return cellPositions[i][1]; })
      .attr("dx", 20) // right padding
      .attr("dy", 20) // vertical alignment : middle
      .attr("transform", "translate(" + CalendarGlobals.gridXTranslation + "," + CalendarGlobals.gridYTranslation + ")")
      .text(function (d) { return d[0]; })
    ;

    // Create a new svg group to store the chart elements and store it globally.
    // Again, as the user navigates through the months by pressing
    // the "back" and "forward" buttons on the page, we clear the chart elements from this group and re add them again.
    CalendarGlobals.chartsGroup = CalendarGlobals.calendar.append("svg:g");

    // Call the function to draw the charts in the cells.
    // This will be called again each time the user presses the forward or backward buttons.
    drawGraphsForMonthlyData();
  }

  // This function is responsible for rendering the days of the month in the grid.
  function renderDaysOfMonth() {
    $('#currentMonth').text(CalendarGlobals.monthToDisplayAsText() + ' ' + CalendarGlobals.yearToDisplay());
    // We get the days for the month we need to display based on the number of times the user has pressed
    // the forward or backward button.
    var daysInMonthToDisplay = CalendarGlobals.daysInMonth();
    var cellPositions = CalendarGlobals.gridCellPositions;

    // All text elements representing the dates in the month are grouped together in the "datesGroup" element by the initalizing
    // function below. The initializing function is also responsible for drawing the rectangles that make up the grid.
    CalendarGlobals.datesGroup
      .selectAll("text")
      .data(daysInMonthToDisplay)
      .attr("x", function (d,i) { return cellPositions[i][0]; })
      .attr("y", function (d,i) { return cellPositions[i][1]; })
      .attr("dx", 20) // right padding
      .attr("dy", 20) // vertical alignment : middle
      .attr("transform", "translate(" + CalendarGlobals.gridXTranslation + "," + CalendarGlobals.gridYTranslation + ")")
      .text(function (d) { return d[0]; }); // Render text for the day of the week

    CalendarGlobals.calendar
      .selectAll("rect")
      .data(daysInMonthToDisplay)
      // Here we change the color depending on whether the day is in the current month, the previous month or the next month.
      // The function that generates the dates for any given month will also specify the colors for days that are not part of the
      // current month. We just have to use it to fill the rectangle
      .style("fill", function (d) { return d[1]; });

    drawGraphsForMonthlyData();
  }

  function drawGraphsForMonthlyData() {
    // Get some random data
    var data = getDataForMonth();
    // Set up variables required to draw a pie chart
    var outerRadius = CalendarGlobals.cellWidth / 3;
    var innerRadius = 0;
    var pie = d3.layout.pie();
    var color = d3.scale.category10();
    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    // We need to index and group the pie charts and slices generated so that they can be rendered in
    // the appropriate cells. To do that, we call D3's 'pie' function of each of the data elements.
    var indexedPieData = [];
    for (var i = 0; i < data.length; i++) {
      var pieSlices = pie(data[i]);
      // This loop is to store an index (j) for each of the slices of a given pie chart. Two different charts
      // on two different days will have the the same set of numbers for slices (eg: 0,1,2). This will help us
      // pick the same colors for the slices for two independent charts. Otherwise, the colors of the slices
      // will be different each day.
      for (var j = 0; j < pieSlices.length; j++) {
        indexedPieData.push([pieSlices[j], i, j]);
      }
    }

    var cellPositions = CalendarGlobals.gridCellPositions;

    CalendarGlobals.chartsGroup
      .selectAll("g.arc")
      .remove();

    var arcs = CalendarGlobals.chartsGroup.selectAll("g.arc")
      // use the indexed data so that each pie chart can be draw in a different cell and therefore for a different day
      .data(indexedPieData)
      .enter()
      .append("g")
      .attr("class", "arc")
      .attr("transform", function (d) {

        // This is where we use the index here to translate the pie chart and render it in the appropriate cell.
        // Normally, the chart would be squashed up against the top left of the cell, obscuring the text that shows the day of the month.
        // We use the gridXTranslation and gridYTranslation and multiply it by a factor to move it to the center of the cell. There is probably
        // a better way of doing this though.
        var currentDataIndex = d[1];
        return "translate(" +  (outerRadius + CalendarGlobals.gridXTranslation * 5 + cellPositions[currentDataIndex][0]) + ", " +  (outerRadius + CalendarGlobals.gridYTranslation * 1.25 + cellPositions[currentDataIndex][1]) + ")";
      });


    arcs.append("path")
      .attr("fill", function (d, i) {
        // The color is generated using the second index. Each slice of the pie is given a fixed number. This applies to all charts (see the indexing loop above).
        // This way, by using the index we can generate teh same colors for each of the slices for different charts on different days.
        return color(d[2]);
      })
      .attr("d", function (d, i) {
        // Standard functions for drawing a pie charts in D3.
        return arc(d[0]);
      });

    arcs.append("text")
      .attr("transform", function (d,i) {
        // Standard functions for drawing a pie charts in D3.
        return "translate(" + arc.centroid(d[0]) + ")";
      })
      .attr("text-anchor", "middle")
      .text(function(d,i) {
        return d[0].value;
      });
  }

  function displayPreviousMonth() {
    CalendarGlobals.decrementCounter();
    renderDaysOfMonth();
  }
  
  function displayNextMonth() {
    CalendarGlobals.incrementCounter();
    renderDaysOfMonth();
  }

  // Generates some random data that can be used to draw pie charts.
  function getDataForMonth() {
    var randomData = [];
    for (var i = 0; i < 35; i++) {
      randomData.push([Math.floor(Math.random()*100),Math.floor(Math.random()*100),Math.floor(Math.random()*100)]);
    }
    return randomData;
  }

  $(document).ready(function(){
    renderCalendarGrid();
    renderDaysOfMonth();
    $('#back').click(displayPreviousMonth);
    $('#forward').click(displayNextMonth);
  });

})(window, jQuery, d3);