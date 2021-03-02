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
    360,
    720
  ];

  public selectedChartColor: ColorRGBA;
  public readonly colors: ColorRGBA[] = [
    new ColorRGBA(70, 130, 200, 1, "Blue"),
    new ColorRGBA(200, 70, 70, 1, "Red"),
    new ColorRGBA(200, 200, 70, 1, "Yellow"),
    new ColorRGBA(70, 200, 1, 1, "Green"),
    new ColorRGBA(180, 0, 180, 1, "Magenta")
  ];

  private svg;
  private marginWidth: number = 60;
  private marginHeight: number = 50;
  private width: number = 800 - (this.marginWidth * 2);
  private height: number = 500 - (this.marginHeight * 2);
  public linesSmooth: boolean = true;

  constructor(private httpService : HttpService) {
    this.selectedCurrency = this.currencies[0];
    this.selectedCurrencyStandard = this.currencyStandards[0];
    this.selectedTimeframe = this.timeframes[1];
    this.selectedChartColor = this.colors[0];
  }

  ngOnInit(): void {
    this.createSvg();
    this.updatePlot();
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

  private updatePlot(): void {
    this.httpService.getRequestCryptocompareHistoric(this.selectedCurrency, this.selectedCurrencyStandard, this.selectedTimeframe).subscribe((data) => {
      console.log("RAW DATA: ");
      console.log(data);
      let dataProcessedFromObservable = CryptoData.parseFromJSON(data);
      this.drawPlot(dataProcessedFromObservable);
    });
  }
  
  private drawPlot(data: CryptoData[]): void {
    // Create the X-axis band scale
    const x = d3
    .scaleTime()
    .domain([d3.min(data, d => d.time) as number, d3.max(data, d => d.time) as number])
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
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Draw the Y-axis to the DOM
    this.svg
    .append("g")
    .call(d3.axisLeft(y));

    this.plotData(x, y, data);
  }

  private plotData(x, y, data: CryptoData[]): void {
    // Draw the lines
    const points: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.average())]
    );
    this.drawLine(points, 2.5, 1.0);
    
    const pointsHighs: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.high)]
    );
    this.drawLine(pointsHighs, 1.5, 0.7);

    const pointsLows: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.low)]
    );
    this.drawLine(pointsLows, 1.5, 0.7);  

    // Draw the area
    const pointsArea: [number, number][] = pointsHighs.concat(pointsLows.reverse());
    this.drawArea(pointsArea, 0.2);

    // Draw the dots
    //this.drawDots(x, y, data, 1);
  }

  private drawLine(points: [number, number][], width: Number, alpha: number): void {
    let color: ColorRGBA = new ColorRGBA(this.selectedChartColor.r, this.selectedChartColor.g, this.selectedChartColor.b, alpha, this.selectedChartColor.descriptor);

    this.svg
      .append("g")
      .append("path")
      .attr("id", "line")
      .style("fill", "none")
      .style("stroke", color)
      .style("stroke-width", width)
      .attr("d", d3.line()
        .curve(this.linesSmooth ? d3.curveBasis : d3.curveLinear)
        .x(d => d[0])
        .y(d => d[1])(points));
  }

  private drawArea(points: [number, number][], alpha: number) {
    let color: ColorRGBA = new ColorRGBA(this.selectedChartColor.r, this.selectedChartColor.g, this.selectedChartColor.b, alpha, this.selectedChartColor.descriptor);
    
    var areaFunction = d3.area()
    .curve(this.linesSmooth ? d3.curveBasis : d3.curveLinear)
    .x(d => d[0])
    .y1(d => d[1])
    .y0(0);

    this.svg
      .append("path")
      .attr("fill", color)
      .attr("d", areaFunction(points));  
  }

  private drawDots(x, y, data: CryptoData[], alpha: number) {
    let color: ColorRGBA = new ColorRGBA(this.selectedChartColor.r, this.selectedChartColor.g, this.selectedChartColor.b, alpha, this.selectedChartColor.descriptor);
    
    this.svg.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.time))
    .attr("cy", d => y(d.average()))
    .style("fill", color)
    .classed("chart-point", true);
  }

  public onSelectCurrency(currency: any) {
    this.selectedCurrency = currency;

    this.createSvg();
    this.updatePlot();
  }

  public onSelectCurrencyStandard(coinStandard: any) {
    this.selectedCurrencyStandard = coinStandard;

    this.createSvg();
    this.updatePlot();
  }

  public onSelectTimeframe(timeframe: any) {
    this.selectedTimeframe = timeframe;

    this.createSvg();
    this.updatePlot();
  }

  public onSelectColor(color: any) {
    this.selectedChartColor = color;

    this.createSvg();
    this.updatePlot();
  }

  public onSmoothLinesToggle() {
    this.linesSmooth = !this.linesSmooth;
    console.log(this.linesSmooth);

    this.createSvg();
    this.updatePlot();
  }

}
