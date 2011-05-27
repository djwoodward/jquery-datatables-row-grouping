/*
* File:        jquery.dataTables.grouping.js
* Version:     0.0.9.dev
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
            return x.substr(iYearIndex, 4);
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

        var oTable = this;
	var iYearIndex = 6;

        var defaults = {

            iGroupingColumnIndex: 0,
            sGroupingColumnSortDirection: "",
            iGroupingOrderByColumnIndex: -1,
            sGrupingClass: "group",
            bHideGroupingColumn: true,
	    bHideGroupingOrderByColumn: true,
            //bGroupingColumnFixedOrder: true,
            sGroupBy: "name",
            sDateFormat: "dd/MM/yyyy",
            sEmptyGroupLabel: "-",
	    bSetGroupingClassOnTR: false,
	    iSecondaryGroupingColumnIndex: 4,
            sSecondaryGroupBy: "name"
		

        };

        properties = $.extend(defaults, options);
        if (properties.iGroupingOrderByColumnIndex == -1)
        {
	    properties.bCustomColumnOrdering = false;
	    properties.iGroupingOrderByColumnIndex = properties.iGroupingColumnIndex;
	} else {
	    properties.bCustomColumnOrdering = true;
	}

	if(properties.sGroupingColumnSortDirection == "")
	{
		if(properties.sGroupBy == "year")
			properties.sGroupingColumnSortDirection = "desc";
		else
			properties.sGroupingColumnSortDirection = "asc";
	}

        var fnGetGroup = _fnGetGroupByName;
        switch (properties.sGroupBy) {
            case "letter": fnGetGroup = _fnGetGroupByLetter;
		
                break;
            case "year": fnGetGroup = _fnGetGroupByYear;
		iYearIndex = properties.sDateFormat.toLowerCase().indexOf('yy');
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
                    var sGroupData = oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[properties.iGroupingColumnIndex];
		    var sGroup = sGroupData;
		    if(properties.sGroupBy != "year")
		    	sGroup = fnGetGroup(sGroupData);
                    if (sLastGroup == null || sGroup != sLastGroup) {
                        var nGroup = document.createElement('tr');
                        var nCell = document.createElement('td');

			if(properties.bSetGroupingClassOnTR){
				nGroup.className = properties.sGrupingClass + " " + sGroup.toLowerCase();
			} else {
				nCell.className = properties.sGrupingClass + " " + sGroup.toLowerCase();
			}

                        nCell.colSpan = iColspan;
                        nCell.innerHTML = sGroup == "" ? properties.sEmptyGroupLabel : sGroup;
			
                        nGroup.appendChild(nCell);
                        nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
                        sLastGroup = sGroup;
                    }
                }


                //-----End grouping


            };

            oTable.fnSetColumnVis(properties.iGroupingColumnIndex, !properties.bHideGroupingColumn);
	    if(properties.bCustomColumnOrdering)
	    {
		oTable.fnSetColumnVis(properties.iGroupingOrderByColumnIndex, !properties.bHideGroupingOrderByColumn);
	    }
            oTable.fnSettings().aoDrawCallback.push({
                "fn": _fnDrawCallBackWithGrouping,
                "sName": "fnRowGroupung"
            });

            oTable.fnSettings().aaSortingFixed = [[properties.iGroupingOrderByColumnIndex, properties.sGroupingColumnSortDirection]];

	    switch(properties.sGroupBy){
		case "name":
			break;


		case "letter":

		/* Create an array with the values of all the input boxes in a column */
                oTable.fnSettings().aoColumns[properties.iGroupingOrderByColumnIndex].sSortDataType = "rg-letter";
                $.fn.dataTableExt.afnSortData['rg-letter'] = function (oSettings, iColumn) {
                    var aData = [];
                    $('td:eq(' + iColumn + ')', oSettings.oApi._fnGetTrNodes(oSettings)).each(function () {
                        aData.push(_fnGetGroupByLetter(this.innerHTML));
                    });
                    return aData;
                }


			break;


		case "year":


		/* Create an array with the values of all the input boxes in a column */
                oTable.fnSettings().aoColumns[properties.iGroupingOrderByColumnIndex].sSortDataType = "rg-date";
                $.fn.dataTableExt.afnSortData['rg-date'] = function (oSettings, iColumn) {
                    var aData = [];
                    $('td:eq(' + iColumn + ')', oSettings.oApi._fnGetTrNodes(oSettings)).each(function () {
                        aData.push(_fnGetYear(this.innerHTML));
                    });
                    return aData;
                }




			break;	
		default:
			break;

	    }
            if (properties.sGroupBy == "name" || properties.sGroupBy == "letter") {

            } else {
                //oTable.fnSettings().aaSortingFixed = [[properties.iGroupingOrderByColumnIndex, properties.sGroupingColumnSortDirection]];
                
            }

            oTable.fnDraw();


        });
    };
})(jQuery);