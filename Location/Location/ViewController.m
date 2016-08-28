//
//  ViewController.m
//  Location
//
//  Created by Cam on 9/6/14.
//  Copyright (c) 2014 camdroid. All rights reserved.
//

#import "ViewController.h"
#import <CoreLocation/CoreLocation.h>

@interface ViewController () <CLLocationManagerDelegate>
@property (strong, nonatomic) IBOutlet UIView *latitude;
@property (strong, nonatomic) IBOutlet UIView *longitude;
@property (weak, nonatomic) IBOutlet UILabel *address;
- (IBAction)buttonPressed:(id)sender;

@end

@implementation ViewController {
    
}
            
- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)buttonPressed:(id)sender {
}
@end
