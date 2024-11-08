import React, { useState, useMemo } from 'react';
import { useLocation } from "react-router-dom";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SelectedCardsTablePage = () => {
  const location = useLocation();
  const selectedCards = location.state?.selectedCards || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your List</h2>

      <Card>
        <CardHeader>
          {/* <CardTitle>Selected Cards</CardTitle> */}
        </CardHeader>
        <CardContent>
          {selectedCards.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <Table>
                {/* <TableCaption>A list of selected cards.</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Trade Name</TableHead>
                    <TableHead className="w-[150px]">Active Ingredient</TableHead>
                    <TableHead className="w-[150px]">Disease</TableHead>
                    <TableHead className="w-[100px]">Country</TableHead>
                    <TableHead className="w-[100px]">Price</TableHead>
                    <TableHead className="w-[100px]">Size</TableHead>
                    <TableHead className="w-[100px]">Mortality Rate</TableHead>
                    <TableHead className="w-[100px]">Morbidity</TableHead>
                    <TableHead className="w-[150px]">Prevalence</TableHead>
                    <TableHead className="w-[200px]">Adverse Events</TableHead>
                    <TableHead className="w-[100px]">Age Group</TableHead>
                    <TableHead className="w-[150px]">Annual Therapy Costs</TableHead>
                    <TableHead className="w-[150px]">Efficacy</TableHead>
                    <TableHead className="w-[100px]">Gender</TableHead>
                    <TableHead className="w-[150px]">Manufacturer</TableHead>
                    <TableHead className="w-[150px]">Quality of Life</TableHead>
                    <TableHead className="w-[150px]">Safety</TableHead>
                    <TableHead className="w-[200px]">Symptoms</TableHead>
                    <TableHead className="w-[150px]">Type of Drug</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCards.map((card, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{card.TradeName}</TableCell>
                      <TableCell>{card["Active Ingredient"]}</TableCell>
                      <TableCell>{card.Disease}</TableCell>
                      <TableCell>{card.Country}</TableCell>
                      <TableCell>${card.Price.toFixed(2)}</TableCell>
                      <TableCell>{card.Size}</TableCell>
                      <TableCell>{card.Mortality.toFixed(2)}%</TableCell>
                      <TableCell>{card.Morbidity.toFixed(2)}</TableCell>
                      <TableCell>{card.Prevalence}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={card.Adverse_Events}>
                          {card.Adverse_Events}
                        </div>
                      </TableCell>
                      <TableCell>{card.Age_Group}</TableCell>
                      <TableCell>${card.Annual_Therapy_Costs}</TableCell>
                      <TableCell>{card.Efficacy}</TableCell>
                      <TableCell>{card.Gender}</TableCell>
                      <TableCell>{card.Manufacturer}</TableCell>
                      <TableCell>{card.Quality_of_Life}</TableCell>
                      <TableCell>{card.Safety}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={card.Symptoms}>
                          {card.Symptoms}
                        </div>
                      </TableCell>
                      <TableCell>{card.Type_of_Drug}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <p className="text-center text-gray-500 py-4">No selected cards available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectedCardsTablePage;
