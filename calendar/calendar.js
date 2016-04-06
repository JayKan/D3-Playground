;(function(global, $) {

  'use strict';

  console.log('Calendar.js Init()');

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
      // total days
      var daysArray = [],
          i;

      var firstDayOfTheWeek = new Date(publicYearToDisplay(), publicMonthToDisplay(), 1).getDay();
      var daysInPreviousMonth = new Date(publicYearToDisplay(), publicMonthToDisplay(), 0).getDay();

      // Lets say the first week of the current month is a Wednesday. Then we need to get 3 days from
      // the end of the previous month. But we can't naively go from 29 - 31. We have to do it properly
      // depending on whether the last month was one that had 31 days, 30 days or 28.
      // figuring out the previous number of days
      for (i = 1; i <= firstDayOfTheWeek; i+=1) {
        daysArray.push([daysInPreviousMonth - firstDayOfTheWeek + i, cellColorForPreviousMonth])
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

      console.log('total daysArray: ', daysArray);
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

  global.onload = function() {
    console.log('Window is loaded');
  };

  $(document).ready(function(){
    console.log('document is raedy');
  })

})(window, jQuery);