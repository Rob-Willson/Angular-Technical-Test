import { Component, OnInit } from "@angular/core";
import { HttpService } from "../core/http.service";
import { CryptoData } from "../core/data";
import { Currency } from "../core/currency";
import { ColorRGBA } from "../core/color";
import * as d3 from "d3";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})

export class ChartComponent implements OnInit {
  public selectedCurrency: Currency;
  public readonly currencies: Currency[] = [
    Currency.BTC,
    Currency.ETH ,
    Currency.LTC,
    Currency.ADA,
    Currency.DOT,
    Currency.BCH,
    Currency.XLM,
    Currency.BNB,
    Currency.USDT,
    Currency.XMR
  ];

  public selectedCurrencyStandard: Currency;
  public readonly currencyStandards: Currency[] = [
    Currency.GBP,
    Currency.EUR,
    Currency.USD,
    Currency.JPY,
    Currency.RUB
  ];
  
  public selectedTimeframe: number;
  public readonly timeframes: number[] = [
    45,
    90,
    180,
    360
  ];

  public selectedChartColor: ColorRGBA;
  public readonly colors: ColorRGBA[] = [
    new ColorRGBA(70, 130, 200, 1, "Blue"),
    new ColorRGBA(200, 70, 70, 1, "Red"),
    new ColorRGBA(200, 200, 70, 1, "Yellow"),
    new ColorRGBA(180, 0, 180, 1, "Magenta")
  ];

  private dataCache: CryptoData[] = [];
  private svg;
  private marginWidth: number = 80;
  private marginHeight: number = 50;
  private width: number = 900 - (this.marginWidth * 2);
  private height: number = 500 - (this.marginHeight * 2);
  public curveType: d3.CurveFactory = d3.curveBasis;

  constructor(private httpService : HttpService) {
    this.selectedCurrency = this.currencies[0];
    this.selectedCurrencyStandard = this.currencyStandards[0];
    this.selectedTimeframe = this.timeframes[1];
    this.selectedChartColor = this.colors[0];
  }

  ngOnInit(): void {
    this.updatePlot(true);
  }

  private updatePlot(requiresNewApiRequest: boolean): void {
    if(requiresNewApiRequest) {
      this.httpService.getRequestCryptocompareHistoric(this.selectedCurrency, this.selectedCurrencyStandard, this.selectedTimeframe).subscribe((data) => {
        this.dataCache = CryptoData.parseFromJSON(data);
        this.createSvg();
        this.drawPlot(this.dataCache);
      });
    }
    else {
      this.createSvg();
      this.drawPlot(this.dataCache);
    }
  }

  private createSvg(): void {
    // Clean up any existing chart
    d3.select("svg").remove();

    this.svg = d3
      .select("figure#chart")
      .append("svg")
      .attr("width", this.width + (this.marginWidth * 2))
      .attr("height", this.height + (this.marginHeight * 2))
      .append("g")
      .attr("transform", "translate(" + this.marginWidth + "," + this.marginHeight + ")");
  }
    
  private drawPlot(data: CryptoData[]): void {
    // Create the X-axis band scale
    // Multiply time number by 1000, because JS Date class uses milliseconds, instead of seconds
    const x = d3
      .scaleTime()
      .domain([d3.min(data, d => d.timeInMillis()) as number, d3.max(data, d => d.timeInMillis()) as number])
      .range([0, this.width]);

    // Create the Y-axis band scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.high) as number])
      .range([this.height, 0]);
    
    // Draw the X-axis to the DOM
    this.svg
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(10,0)")
      .style("text-anchor", "end");

    // X-axis label
    this.svg
      .append("text")
      .style("fill", "rgb(210, 210, 210)")
      .attr("x", this.width / 2 )
      .attr("y", this.height + 40)
      .style("text-anchor", "middle")
      .text("Date (from " + d3.min(data, d => d.dateFromTimestamp())?.toDateString() + " to " + d3.max(data, d => d.dateFromTimestamp())?.toDateString() + ")");

    // Draw the Y-axis to the DOM
    this.svg
      .append("g")
      .call(d3.axisLeft(y));

    // Y-axis label
    this.svg.append("text")
      .style("fill", "rgb(210, 210, 210)")
      .attr("transform", "rotate(-90)")
      .attr("x", (-this.height / 2) - this.marginHeight)
      .attr("y", -64)
      .text("Value (" + this.selectedCurrencyStandard + ")");

    this.plotData(x, y, data);
  }

  private plotData(x, y, data: CryptoData[]): void {
    // Draw the lines
    const points: [number, number][] = data.map(
      d => [x(d.dateFromTimestamp()), y(d.average())]
    );
    this.drawLine(points, 2.5, 1.0);
    
    const pointsHighs: [number, number][] = data.map(
      d => [x(d.dateFromTimestamp()), y(d.high)]
    );
    this.drawLine(pointsHighs, 1.5, 0.7);

    const pointsLows: [number, number][] = data.map(
      d => [x(d.dateFromTimestamp()), y(d.low)]
    );
    this.drawLine(pointsLows, 1.5, 0.7);  

    // Draw the area
    const pointsArea: [number, number][] = pointsHighs.concat(pointsLows.reverse());
    this.drawArea(pointsArea, 0.2);

    // Draw the 'scrubber' components
    this.drawScrubber(data);
  }

  private drawLine(points: [number, number][], width: Number, alpha: number): void {
    let color: ColorRGBA = new ColorRGBA(this.selectedChartColor.r, this.selectedChartColor.g, this.selectedChartColor.b, alpha, this.selectedChartColor.descriptor);

    this.svg
      .append("path")
      .attr("id", "line")
      .style("fill", "none")
      .style("stroke", color)
      .style("stroke-width", width)
      .attr("d", d3.line()
        .curve(this.curveType)
        .x(d => d[0])
        .y(d => d[1])(points));
  }

  private drawArea(points: [number, number][], alpha: number) {
    let color: ColorRGBA = new ColorRGBA(this.selectedChartColor.r, this.selectedChartColor.g, this.selectedChartColor.b, alpha, this.selectedChartColor.descriptor);
    
    let areaFunction = d3
      .area()
      .curve(this.curveType)
      .x(d => d[0])
      .y1(d => d[1])
      .y0(0);

    this.svg
      .append("path")
      .attr("fill", color)
      .attr("d", areaFunction(points));  
  }

  private drawScrubber(data: CryptoData[]) {
    let splitWidth: number = this.width / this.selectedTimeframe;

    for(let i = 1; i < data.length; i++) {
      let svg = this.svg
        .append("g")
        .classed("chart-point", true); 
      
      svg
        .append("rect")
        .attr("x", splitWidth * (i - 1))
        .attr("y", 0)
        .attr("width", this.width / this.selectedTimeframe + 2)
        .attr("height", this.height)
        .style("opacity", 0)
        .style("fill", "white");

      svg
        .append("rect")
        .attr("x", splitWidth * (i - 1) + this.width / this.selectedTimeframe / 2)
        .attr("y", 0)
        .attr("width", 2)
        .attr("height", this.height)
        .style("fill", "white");

      svg
        .append("text")
        .text(data[i].dateFromTimestamp().toDateString())
        .attr("x", (splitWidth) * i - (data[i].high.toString().length * 3))
        .attr("y", -22)
        .attr("fill", "white");

      svg
        .append("text")
        .text(data[i].low + " - " + data[i].high)
        .attr("x", (splitWidth) * i - (data[i].high.toString().length * 3))
        .attr("y", -6)
        .attr("fill", "white");
    }
  }

  public onSelectCurrency(currency: any) {
    this.selectedCurrency = currency;
    this.updatePlot(true);
  }

  public onSelectCurrencyStandard(coinStandard: any) {
    this.selectedCurrencyStandard = coinStandard;
    this.updatePlot(true);
  }

  public onSelectTimeframe(timeframe: any) {
    this.selectedTimeframe = timeframe;
    this.updatePlot(true);
  }

  public onSelectColor(color: any) {
    this.selectedChartColor = color;
    this.updatePlot(false);
  }
  
}
