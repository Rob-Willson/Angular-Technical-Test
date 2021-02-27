import { Component, OnInit } from '@angular/core';
import { HttpService } from '../core/http.service';
import { CryptoData } from '../core/data.template';
import { Coin } from '../core/coin.template';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnInit {
  private readonly urlBase: string = "https://min-api.cryptocompare.com/data/v2/histoday";
  private urlCurrencyId: string = "BTC";
  private urlCurrencyStandardId: string = "USD";
  private urlCount: number = 5;
  // TODO: API key?

  private svg;
  private margin = 50;
  private width = 600 - (this.margin * 2);
  private height = 400 - (this.margin * 2);
  
  // All supported crytocurrencies with their default display values
  public coins: Coin[] = [
    new Coin("BTC", true),
    new Coin("ETH", false),
    new Coin("LTC", false),
    new Coin("ADA", false),
    new Coin("DOT", false),
    new Coin("BCH", false),
    new Coin("XLM", false),
    new Coin("BNB", false),
    new Coin("USDT", false),
    new Coin("XMR", false),
  ];

  constructor(private httpService : HttpService) { }

  ngOnInit(): void {
    this.httpService.getRequest(this.buildUrl());
    
    // TODO: This should be the data from the API call
    let data = [
      {"Year": "2016", "Assets": "405.9" },
      {"Year": "2017", "Assets": "409.4" },
      {"Year": "2018", "Assets": "643.3" },
      {"Year": "2019", "Assets": "618.2" }
    ];
        
    this.createSvg();
    this.drawBars(data);
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
  }

  private buildUrl() : string {
    let url : string = this.urlBase + "?";
    // Request requires a querying currency (fsym) and a standard (tsym) to compare it with
    url += "fsym=" + this.urlCurrencyId + "&";
    url += "tsym=" + this.urlCurrencyStandardId;
    // Cryptocompare API uses base 0 for it's counts, but most humans don't
    url += "&limit=" + (this.urlCount - 1);
    return url;
  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
    .range([0, this.width])
    .domain(data.map(d => d.Year))
    .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
    .domain([0, 800])
    .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
    .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Year))
    .attr("y", d => y(d.Assets))
    .attr("width", x.bandwidth())
    .attr("height", (d) => this.height - y(d.Assets))
    .attr("fill", "#ff8080");
  }  

}
