import { Component, OnInit } from "@angular/core";
import { HttpService } from "../core/http.service";
import { CryptoData } from "../core/data.template";
import { Coin, CoinType } from "../core/coin.template";
import * as d3 from "d3";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})

export class ChartComponent implements OnInit {
  private selectedCurrencyId: string = "BTC";
  private selectedCurrencyStandardId: string = "USD";
  private dataCount: number = 90;

  private svg;
  private margin: number = 50;
  private width: number = 800 - (this.margin * 2);
  private height: number = 600 - (this.margin * 2);

  // All supported crytocurrencies with their default display values
  public coins: Coin[] = Coin.GetAllCoins();

  constructor(private httpService : HttpService) {}

  ngOnInit(): void {
    this.createSvg();
    this.updatePlot();
  }

  private createSvg(): void {
    // Clean up any existing chart
    d3.select("svg").remove();

    this.svg = d3
    .select("figure#bar")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private updatePlot(): void {
    console.log("updatePlot passed value of: " + this.getSelectedCurrencyId());

    this.httpService.getRequestCryptocompareHistoric(this.selectedCurrencyId, this.selectedCurrencyStandardId, this.dataCount).subscribe((data) => {
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
    .domain([0, d3.max(data, d => d.average()) as number])
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
    this.drawLine(x, y, points, 2.5, "rgba(70, 130, 180, 1)");
    
    const pointsHighs: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.high)]
    );
    this.drawLine(x, y, pointsHighs, 1.5, "rgba(70, 130, 180, 0.7)");

    const pointsLows: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.low)]
    );
    this.drawLine(x, y, pointsLows, 1.5, "rgba(70, 130, 180, 0.7)");  

    // Draw the area
    const pointsArea: [number, number][] = pointsHighs.concat(pointsLows.reverse());
    this.drawArea(pointsArea, "rgba(70, 130, 180, 0.2)");

    // Draw the dots
    //this.drawDots(x, y, data, "rgba(70, 130, 180, 0.2)");
  }

  private drawLine(x, y, points: [number, number][], width: Number, color: string): void {
    this.svg
      .append("g")
      .append("path")
      .attr("id", "line")
      .style("fill", "none")
      .style("stroke", color)
      .style("stroke-width", width)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(d => d[0])
        .y(d => d[1])(points));
  }

  private drawArea(points: [number, number][], color: string) {
    var areaFunction = d3.area()
    .curve(d3.curveBasis)
    .x(d => d[0])
    .y1(d => d[1])
    .y0(0);

    this.svg
      .append("path")
      .attr("fill", color)
      .attr("d", areaFunction(points));  
  }

  private drawDots(x, y, data: CryptoData[], color: string) {
    this.svg.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.time))
    .attr("cy", d => y(d.average()))
    .classed("chart-point", true);
  }

  onSelectCoin(coinId: any) {
    console.log("onSelectCoin(" + coinId + ") CALLED");

    this.coins.forEach(coin => {
      if(coinId == coin.id) {
        coin.active = !coin.active;
      }
    });

    let logMessage: string = "";
    this.coins.forEach(coin => {
      logMessage += coin.id + ": " + coin.active + ", ";
    });
    console.log(logMessage);

    this.selectedCurrencyId = this.getSelectedCurrencyId();

    this.createSvg();
    this.updatePlot();
  }

  private getSelectedCurrencyId(): string {
    this.coins.forEach(coin => {
      if(coin.active){
        console.log("getSelectedCurrencyId() returning: " + coin.id.toString());
        return coin.id.toString();
      }
    });

    console.log("Unexpected call. Bug?");
    return "undefined";
  }

}
