import { Component, OnInit } from "@angular/core";
import { HttpService } from "../core/http.service";
import { CryptoData } from "../core/data";
import { Coin } from "../core/coin";
import { ColorRGBA } from "../core/color";
import * as d3 from "d3";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})

export class ChartComponent implements OnInit {
  public selectedCurrencyId: Coin;
  public coins: Coin[] = [];

  public selectedCurrencyStandardId: string;
  public coinStandards: string[] = [
    "GBP",
    "EUR",
    "USD",
    "JPY",
    "RUB"
  ];

  public currentChartColor: ColorRGBA;
  public colors: ColorRGBA[] = [
    new ColorRGBA(70, 130, 200, 1, "Blue"),
    new ColorRGBA(200, 70, 70, 1, "Red"),
    new ColorRGBA(200, 200, 70, 1, "Yellow"),
    new ColorRGBA(70, 200, 1, 1, "Green"),
    new ColorRGBA(180, 0, 180, 1, "Magenta")
  ];

  private dataCount: number = 90;

  private svg;
  private marginWidth: number = 60;
  private marginHeight: number = 50;
  private width: number = 800 - (this.marginWidth * 2);
  private height: number = 500 - (this.marginHeight * 2);
  public linesSmooth: boolean = true;
    
  constructor(private httpService : HttpService) {
    this.coins = Coin.GetAllCoins();
    this.selectedCurrencyId = this.coins[0];
    this.selectedCurrencyStandardId = "GBP";
    this.currentChartColor = this.colors[0];
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
    this.httpService.getRequestCryptocompareHistoric(this.selectedCurrencyId.id, this.selectedCurrencyStandardId, this.dataCount).subscribe((data) => {
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
    //.domain([0, d3.max(data, d => d.average()) as number])
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
    let color: ColorRGBA = new ColorRGBA(this.currentChartColor.r, this.currentChartColor.g, this.currentChartColor.b, alpha, this.currentChartColor.descriptor);

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
    let color: ColorRGBA = new ColorRGBA(this.currentChartColor.r, this.currentChartColor.g, this.currentChartColor.b, alpha, this.currentChartColor.descriptor);
    
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
    let color: ColorRGBA = new ColorRGBA(this.currentChartColor.r, this.currentChartColor.g, this.currentChartColor.b, alpha, this.currentChartColor.descriptor);
    
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

  public onSelectCoin(coinId: any) {
    if(coinId == this.selectedCurrencyId.id) {
      return;
    }

    this.coins.forEach(coin => {
      if(coinId == coin.id) {
        coin.active = !coin.active;
        this.selectedCurrencyId = coin;
      }
      else {
        coin.active = false;
      }
    });

    this.createSvg();
    this.updatePlot();
  }

  public onSelectStandard(coinStandard: any) {
    this.selectedCurrencyStandardId = coinStandard;

    this.createSvg();
    this.updatePlot();
  }

  public onSelectColor(color: any) {
    this.currentChartColor = color;

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
