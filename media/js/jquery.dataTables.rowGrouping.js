/*
* File:        jquery.dataTables.grouping.js
* Version:     0.0.7.dev
* Author:      Jovan Popovic 
* 
* Copyright 2011 Jovan Popovic, all rights reserved.
*
* This source file is free software, under either the GPL v2 license or a
* BSD style license, as supplied with this software.
* 
* This source file is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
* or FITNESS FOR A PARTICULAR PURPOSE. 
* 
*/
(function ($) {

    $.fn.rowGrouping = function (options) {

        function _fnGetYear(x) {
            return x.substr(x.lastIndexOf('/') + 1, 4);
        }
        function _fnGetGroupByName(x) {
            return x;
        }

        function _fnGetGroupByLetter(x) {
            return x.substr(0, 1);
        }

        function _fnGetGroupByYear(x) {
            return _fnGetYear(x);
            //return Date.parseExact(x, properties.sDateFormat).getFullYear();//slooooow
        }

        function _fnGetGroupByYearMonth(x) {
            var date = Date.parseExact(x, "dd/MM/yyyy");
            return date.getFullYear() + " / " + date.getMonthName();
        }

        oTable = this;

        var defaults = {

            iGroupingColumnIndex: 0,
            sGroupingColumnSortDirection: "desc",
            iGroupingOrderByColumnIndex: -1,
            sGrupingClass: "group",
            bHideGroupingColumn: true,
            //bGroupingColumnFixedOrder: true,
            sGroupBy: "name",
            sDateFormat: "dd/MM/yyyy",
            sEmptyGroupLabel: "-"

        };

        properties = $.extend(defaults, options);
        if (properties.iGroupingOrderByColumnIndex == -1)
            properties.iGroupingOrderByColumnIndex = properties.iGroupingColumnIndex;

        var fnGetGroup = _fnGetGroupByName;
        switch (properties.sGroupBy) {
            case "letter": fnGetGroup = _fnGetGroupByLetter;
                break;
            case "year": fnGetGroup = _fnGetGroupByYear;
                break;
            case "month": fnGetGroup = _fnGetGroupByYearMonth;
                break;
            default: fnGetGroup = _fnGetGroupByName;
                break;
        }

        return this.each(function () {


            var _fnDrawCallBackWithGrouping = function (oSettings) {

                //-----Start grouping

                if (oSettings.aiDisplay.length == 0) {
                    return;
                }

                var nTrs = $('tbody tr', oTable);
                var iColspan = nTrs[0].getElementsByTagName('td').length;
                var sLastGroup = null;
                for (var i = 0; i < nTrs.length; i++) {
                    var iDisplayIndex = oSettings._iDisplayStart + i;
                    var sGroup = oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[properties.iGroupingColumnIndex];
                    if (sLastGroup == null || fnGetGroup(sGroup) != sLastGroup) {
                        var nGroup = document.createElement('tr');
                        var nCell = document.createElement('td');
                        nCell.colSpan = iColspan;
                        nCell.className = properties.sGrupingClass;
                        nCell.innerHTML = fnGetGroup(sGroup) == "" ? properties.sEmptyGroupLabel : fnGetGroup(sGroup);
                        nGroup.appendChild(nCell);
                        nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
                        sLastGroup = fnGetGroup(sGroup);
                    }
                }


                //-----End grouping


            };

            oTable.fnSetColumnVis(properties.iGroupingColumnIndex, !properties.bHideGroupingColumn);
            oTable.fnSettings().aoDrawCallback.push({
                "fn": _fnDrawCallBackWithGrouping,
                "sName": "fnRowGroupung"
            });



            if (properties.sGroupBy == "name" || properties.sGroupBy == "letter") {
                oTable.fnSettings().aaSortingFixed = [[properties.iGroupingOrderByColumnIndex, properties.sGroupingColumnSortDirection]];
            } else {
                oTable.fnSettings().aaSortingFixed = [[properties.iGroupingOrderByColumnIndex, properties.sGroupingColumnSortDirection]];
                /* Create an array with the values of all the input boxes in a column */
                oTable.fnSettings().aoColumns[properties.iGroupingOrderByColumnIndex].sSortDataType = "rg-date";
                $.fn.dataTableExt.afnSortData['rg-date'] = function (oSettings, iColumn) {
                    /*
                    $(oTable.fnSettings().aaSortingFixed).each(function () {
                    if (this[0] == iColumn) {
                    if (this[1] == "asc")
                    this[1] = "desc";
                    else
                    this[1] = "asc";
                    }
                    });
                    */
                    var aData = [];
                    $('td:eq(' + iColumn + ')', oSettings.oApi._fnGetTrNodes(oSettings)).each(function () {
                        aData.push(_fnGetYear(this.innerHTML));
                    });
                    return aData;
                }
            }

            oTable.fnDraw();


        });
    };
})(jQuery);